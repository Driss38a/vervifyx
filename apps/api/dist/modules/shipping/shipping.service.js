"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShippingService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const moderation_service_1 = require("../moderation/moderation.service");
const orders_service_1 = require("../orders/orders.service");
const ranking_1 = require("./ranking");
const DAY = 24 * 60 * 60 * 1000;
const TRANSITIONS = {
    CREATED: ['PICKED_UP'],
    PICKED_UP: ['IN_TRANSIT', 'OUT_FOR_DELIVERY'],
    IN_TRANSIT: ['OUT_FOR_DELIVERY', 'FAILED'],
    OUT_FOR_DELIVERY: ['DELIVERED', 'FAILED'],
    FAILED: ['OUT_FOR_DELIVERY', 'RETURNED'],
    DELIVERED: [],
    RETURNED: [],
};
let ShippingService = class ShippingService {
    constructor(prisma, moderation, orders) {
        this.prisma = prisma;
        this.moderation = moderation;
        this.orders = orders;
    }
    async register(userId, dto) {
        if (await this.prisma.carrier.findUnique({ where: { userId }, select: { id: true } })) {
            throw new common_1.ConflictException('You already have a carrier profile');
        }
        if (this.moderation.screenText(dto.companyName).decision === 'REJECT') {
            throw new common_1.BadRequestException('Company name violates the marketplace policy');
        }
        return this.prisma.carrier.create({ data: { userId, companyName: dto.companyName, countries: [] } });
    }
    async myCarrier(userId) {
        const carrier = await this.prisma.carrier.findUnique({ where: { userId }, include: { zones: true } });
        if (!carrier)
            throw new common_1.NotFoundException('Carrier profile not found');
        return carrier;
    }
    async setZones(userId, dto) {
        const carrier = await this.prisma.carrier.findUnique({ where: { userId }, select: { id: true } });
        if (!carrier)
            throw new common_1.NotFoundException('Carrier profile not found');
        const zones = dto.zones.map((z) => ({
            carrierId: carrier.id, country: z.country.toUpperCase(), region: z.region ?? null,
            priceMinor: z.priceMinor, currency: z.currency.toUpperCase(), etaDays: z.etaDays,
        }));
        const countries = [...new Set(zones.map((z) => z.country))];
        return this.prisma.$transaction(async (tx) => {
            await tx.carrierZone.deleteMany({ where: { carrierId: carrier.id } });
            await tx.carrierZone.createMany({ data: zones });
            return tx.carrier.update({ where: { id: carrier.id }, data: { countries }, include: { zones: true } });
        });
    }
    setStatus(id, status) {
        return this.prisma.carrier.update({ where: { id }, data: { status: status } });
    }
    listPublic(country) {
        return this.prisma.carrier.findMany({
            where: { status: client_1.CarrierStatus.ACTIVE, ...(country ? { countries: { has: country.toUpperCase() } } : {}) },
            select: { id: true, companyName: true, countries: true, ratingAvg: true },
            orderBy: { companyName: 'asc' },
            take: 100,
        });
    }
    rankingPolicy() {
        return {
            weights: ranking_1.WEIGHTS,
            rules: [
                'Ranking uses only price, delivery speed, rating and reliability.',
                'Subscription tier never changes a carrier\'s rank.',
                `Carriers with fewer than ${ranking_1.NEWCOMER_MIN_FINISHED} finished deliveries get a neutral rating (${ranking_1.NEUTRAL_RATING}/5) so newcomers are not buried.`,
                `Automatic assignment spreads orders among carriers within ${ranking_1.BALANCE_TOLERANCE * 100}% of the best score, favouring the one with the lightest recent load.`,
            ],
        };
    }
    async ratesForOrder(ownerId, orderId) {
        const order = await this.sellerOrder(ownerId, orderId);
        return this.computeRates(order);
    }
    async assign(ownerId, orderId, dto) {
        const order = await this.sellerOrder(ownerId, orderId);
        if (order.shipment)
            throw new common_1.ConflictException('A carrier is already assigned');
        if (order.status !== client_1.OrderStatus.CONFIRMED)
            throw new common_1.BadRequestException('Confirm the order before choosing a carrier');
        if (!order.items.some((i) => i.product.type === client_1.ProductType.PHYSICAL))
            throw new common_1.BadRequestException('This order needs no shipping');
        const ranked = await this.computeRates(order);
        if (!ranked.length)
            throw new common_1.BadRequestException('No carrier serves this destination in this currency');
        let chosen = ranked[0];
        if (dto.mode === 'MANUAL') {
            if (!dto.carrierId)
                throw new common_1.BadRequestException('carrierId is required in MANUAL mode');
            const found = ranked.find((r) => r.carrierId === dto.carrierId);
            if (!found)
                throw new common_1.BadRequestException('This carrier is not available for the order');
            chosen = found;
        }
        else {
            chosen = (0, ranking_1.pickBalanced)(ranked) ?? ranked[0];
        }
        if (chosen.priceMinor + order.platformFeeMinor > order.totalMinor) {
            throw new common_1.BadRequestException('Carrier fee exceeds the order value; choose a cheaper option');
        }
        return this.prisma.shipment.create({
            data: {
                orderId, carrierId: chosen.carrierId, currency: order.currency,
                trackingCode: `VFX-${(0, crypto_1.randomBytes)(5).toString('hex').toUpperCase()}`,
                carrierFeeMinor: chosen.priceMinor,
                codAmountMinor: order.payment?.method === client_1.PaymentMethod.COD ? order.totalMinor : null,
                events: { create: { status: client_1.ShipmentStatus.CREATED, note: 'Carrier assigned' } },
            },
            include: { events: true },
        });
    }
    async carrierShipments(userId) {
        return this.prisma.shipment.findMany({
            where: { carrier: { userId }, status: { notIn: [client_1.ShipmentStatus.DELIVERED, client_1.ShipmentStatus.RETURNED] } },
            include: { order: { select: { id: true, totalMinor: true, currency: true, shippingAddress: true } } },
            orderBy: { createdAt: 'desc' },
            take: 100,
        });
    }
    async addEvent(userId, shipmentId, dto) {
        return this.prisma.$transaction(async (tx) => {
            const shipment = await tx.shipment.findFirst({
                where: { id: shipmentId, carrier: { userId, status: client_1.CarrierStatus.ACTIVE } },
            });
            if (!shipment)
                throw new common_1.NotFoundException('Shipment not found');
            if (!TRANSITIONS[shipment.status].includes(dto.status)) {
                throw new common_1.BadRequestException(`Cannot move from ${shipment.status} to ${dto.status}`);
            }
            await tx.shipment.update({ where: { id: shipmentId }, data: { status: dto.status } });
            await tx.trackingEvent.create({ data: { shipmentId, status: dto.status, note: dto.note } });
            if (dto.status === client_1.ShipmentStatus.PICKED_UP) {
                await tx.order.updateMany({ where: { id: shipment.orderId, status: client_1.OrderStatus.CONFIRMED }, data: { status: client_1.OrderStatus.SHIPPED } });
            }
            else if (dto.status === client_1.ShipmentStatus.DELIVERED) {
                await this.orders.markDelivered(shipment.orderId, tx);
            }
            else if (dto.status === client_1.ShipmentStatus.RETURNED) {
                await this.orders.markReturned(shipment.orderId, tx);
            }
            return tx.shipment.findUnique({ where: { id: shipmentId }, include: { events: { orderBy: { createdAt: 'asc' } } } });
        });
    }
    async track(code) {
        const shipment = await this.prisma.shipment.findUnique({
            where: { trackingCode: code.toUpperCase() },
            select: { trackingCode: true, status: true, createdAt: true, carrier: { select: { companyName: true } },
                events: { select: { status: true, note: true, createdAt: true }, orderBy: { createdAt: 'asc' } } },
        });
        if (!shipment)
            throw new common_1.NotFoundException('Tracking code not found');
        return shipment;
    }
    sellerOrder(ownerId, orderId) {
        return this.prisma.order.findFirst({
            where: { id: orderId, store: { ownerId } },
            include: { payment: true, shipment: true, items: { include: { product: { select: { type: true } } } } },
        }).then((o) => {
            if (!o)
                throw new common_1.NotFoundException('Order not found');
            return o;
        });
    }
    async computeRates(order) {
        const addr = order.shippingAddress;
        const country = addr?.country?.toUpperCase();
        if (!country)
            throw new common_1.BadRequestException('Order has no destination country');
        const walletPaid = order.payment?.method === client_1.PaymentMethod.WALLET;
        const carriers = await this.prisma.carrier.findMany({
            where: { status: client_1.CarrierStatus.ACTIVE, countries: { has: country } },
            include: {
                zones: { where: { country, currency: order.currency } },
                user: { select: { wallet: { select: { currency: true } } } },
            },
        });
        if (!carriers.length)
            return [];
        const ids = carriers.map((c) => c.id);
        const since90 = new Date(Date.now() - 90 * DAY);
        const since30 = new Date(Date.now() - 30 * DAY);
        const [byStatus, recent] = await Promise.all([
            this.prisma.shipment.groupBy({ by: ['carrierId', 'status'], where: { carrierId: { in: ids }, createdAt: { gte: since90 } }, _count: { _all: true } }),
            this.prisma.shipment.groupBy({ by: ['carrierId'], where: { carrierId: { in: ids }, createdAt: { gte: since30 } }, _count: { _all: true } }),
        ]);
        const region = addr?.region?.toLowerCase();
        const candidates = [];
        for (const c of carriers) {
            const zone = c.zones.find((z) => z.region && region && z.region.toLowerCase() === region) ?? c.zones.find((z) => !z.region);
            if (!zone)
                continue;
            if (walletPaid && c.user.wallet?.currency !== order.currency)
                continue;
            const count = (st) => byStatus.find((r) => r.carrierId === c.id && r.status === st)?._count._all ?? 0;
            const delivered = count(client_1.ShipmentStatus.DELIVERED);
            const finished = delivered + count(client_1.ShipmentStatus.RETURNED) + count(client_1.ShipmentStatus.FAILED);
            candidates.push({
                meta: { companyName: c.companyName, zoneId: zone.id, currency: zone.currency },
                input: {
                    carrierId: c.id, priceMinor: zone.priceMinor, etaDays: zone.etaDays, ratingAvg: c.ratingAvg,
                    finished, delivered, shipments30d: recent.find((r) => r.carrierId === c.id)?._count._all ?? 0,
                },
            });
        }
        const ranked = (0, ranking_1.rankCarriers)(candidates.map((c) => c.input));
        return ranked.map((r) => ({ ...r, ...candidates.find((c) => c.input.carrierId === r.carrierId).meta }));
    }
};
exports.ShippingService = ShippingService;
exports.ShippingService = ShippingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object, typeof (_b = typeof moderation_service_1.ModerationService !== "undefined" && moderation_service_1.ModerationService) === "function" ? _b : Object, orders_service_1.OrdersService])
], ShippingService);
//# sourceMappingURL=shipping.service.js.map