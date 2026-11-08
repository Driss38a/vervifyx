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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const wallet_service_1 = require("../wallet/wallet.service");
const json = (v) => v;
const ORDER_INCLUDE = {
    items: true,
    payment: true,
    shipment: { select: { id: true, trackingCode: true, status: true, carrierId: true } },
};
let OrdersService = class OrdersService {
    constructor(prisma, wallet, config) {
        this.prisma = prisma;
        this.wallet = wallet;
        this.config = config;
    }
    async create(buyerId, dto) {
        const products = await this.prisma.product.findMany({
            where: { id: { in: [...new Set(dto.items.map((i) => i.productId))] } },
            include: { variants: true, store: { include: { owner: { select: { wallet: { select: { currency: true } } } } } } },
        });
        const byId = new Map(products.map((p) => [p.id, p]));
        const groups = new Map();
        for (const item of dto.items) {
            const p = byId.get(item.productId);
            if (!p || p.status !== client_1.ProductStatus.ACTIVE || p.store.status !== client_1.StoreStatus.ACTIVE) {
                throw new common_1.BadRequestException('A product is no longer available');
            }
            if (p.store.ownerId === buyerId)
                throw new common_1.BadRequestException('You cannot buy from your own store');
            let variant = null;
            if (p.variants.length) {
                variant = p.variants.find((v) => v.id === item.variantId) ?? null;
                if (!variant)
                    throw new common_1.BadRequestException(`Select a valid option for "${p.title}"`);
            }
            else if (item.variantId) {
                throw new common_1.BadRequestException(`"${p.title}" has no options`);
            }
            const physical = p.type === client_1.ProductType.PHYSICAL;
            const key = `${p.storeId}:${physical ? 'P' : 'D'}`;
            let g = groups.get(key);
            if (!g) {
                g = { store: p.store, physical, currency: p.currency, lines: [] };
                groups.set(key, g);
            }
            if (g.currency !== p.currency)
                throw new common_1.BadRequestException('Items from the same store must share one currency');
            g.lines.push({
                productId: p.id, variantId: variant?.id ?? null, title: p.title, variantName: variant?.name ?? null,
                unitPriceMinor: variant?.priceMinor ?? p.priceMinor, quantity: item.quantity,
                stock: variant ? (variant.stock !== null ? 'variant' : null) : (p.stock !== null ? 'product' : null),
            });
        }
        const method = dto.paymentMethod === 'COD' ? client_1.PaymentMethod.COD : client_1.PaymentMethod.WALLET;
        const address = dto.shippingAddress ? { ...dto.shippingAddress, country: dto.shippingAddress.country.toUpperCase() } : null;
        const bps = Number(this.config.get('PLATFORM_FEE_BPS') ?? 0) || 0;
        for (const g of groups.values()) {
            if (g.physical && !address)
                throw new common_1.BadRequestException('A shipping address is required for physical products');
            if (!g.physical && method === client_1.PaymentMethod.COD)
                throw new common_1.BadRequestException('Cash on delivery is only available for physical products');
            if (g.store.owner.wallet?.currency !== g.currency) {
                throw new common_1.BadRequestException(`"${g.store.name}" cannot receive payments in ${g.currency} yet`);
            }
        }
        return this.prisma.$transaction(async (tx) => {
            const created = [];
            for (const g of groups.values()) {
                const subtotal = g.lines.reduce((sum, l) => sum + l.unitPriceMinor * l.quantity, 0);
                const free = g.store.freeShippingOverMinor !== null && subtotal >= g.store.freeShippingOverMinor;
                const shipping = g.physical && !free ? g.store.shippingFlatMinor : 0;
                const platformFee = Math.round((subtotal * bps) / 10_000);
                const total = subtotal + shipping;
                for (const l of g.lines)
                    await this.takeStock(tx, l);
                const order = await tx.order.create({
                    data: {
                        buyerId, storeId: g.store.id, currency: g.currency,
                        subtotalMinor: subtotal, shippingFeeMinor: shipping, platformFeeMinor: platformFee, totalMinor: total,
                        shippingAddress: json(g.physical ? address : {}), buyerNote: dto.note,
                        items: { create: g.lines.map(({ stock: _stock, ...line }) => line) },
                        payment: {
                            create: {
                                method, amountMinor: total, currency: g.currency,
                                status: method === client_1.PaymentMethod.WALLET ? client_1.PaymentStatus.AUTHORIZED : client_1.PaymentStatus.PENDING,
                            },
                        },
                    },
                    include: ORDER_INCLUDE,
                });
                if (method === client_1.PaymentMethod.WALLET)
                    await this.wallet.debitForEscrow(tx, buyerId, total, g.currency, order.id);
                created.push(order);
            }
            return created;
        });
    }
    mine(buyerId, page = 1) {
        return this.prisma.order.findMany({
            where: { buyerId }, include: ORDER_INCLUDE, orderBy: { createdAt: 'desc' }, skip: (page - 1) * 20, take: 20,
        });
    }
    async forStore(ownerId, storeId, status) {
        const store = await this.prisma.store.findFirst({ where: { id: storeId, ownerId }, select: { id: true } });
        if (!store)
            throw new common_1.NotFoundException('Store not found');
        return this.prisma.order.findMany({
            where: { storeId, ...(status ? { status } : {}) }, include: ORDER_INCLUDE, orderBy: { createdAt: 'desc' }, take: 100,
        });
    }
    async getOne(userId, role, id) {
        const order = await this.prisma.order.findUnique({
            where: { id }, include: { ...ORDER_INCLUDE, store: { select: { ownerId: true, slug: true, name: true } } },
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        const allowed = order.buyerId === userId || order.store.ownerId === userId || role === client_1.Role.ADMIN || role === client_1.Role.MODERATOR;
        if (!allowed)
            throw new common_1.ForbiddenException();
        return order;
    }
    async confirm(ownerId, id) {
        const order = await this.prisma.order.findFirst({ where: { id, store: { ownerId } }, select: { id: true, status: true } });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        if (order.status !== client_1.OrderStatus.PENDING)
            throw new common_1.BadRequestException('Only pending orders can be confirmed');
        return this.prisma.order.update({ where: { id }, data: { status: client_1.OrderStatus.CONFIRMED }, include: ORDER_INCLUDE });
    }
    async cancel(userId, id) {
        return this.prisma.$transaction(async (tx) => {
            const order = await tx.order.findUnique({
                where: { id }, include: { payment: true, shipment: { select: { id: true } }, store: { select: { ownerId: true } } },
            });
            if (!order)
                throw new common_1.NotFoundException('Order not found');
            const isBuyer = order.buyerId === userId;
            const isSeller = order.store.ownerId === userId;
            if (!isBuyer && !isSeller)
                throw new common_1.ForbiddenException();
            if (order.shipment)
                throw new common_1.BadRequestException('A carrier is already assigned to this order');
            const cancellable = isBuyer ? [client_1.OrderStatus.PENDING] : [client_1.OrderStatus.PENDING, client_1.OrderStatus.CONFIRMED];
            if (!cancellable.includes(order.status))
                throw new common_1.BadRequestException(`Order cannot be cancelled in status ${order.status}`);
            await this.unwind(tx, order, client_1.OrderStatus.CANCELLED);
            return tx.order.findUnique({ where: { id }, include: ORDER_INCLUDE });
        });
    }
    async complete(ownerId, id) {
        const order = await this.prisma.order.findFirst({
            where: { id, store: { ownerId } },
            include: { items: { include: { product: { select: { type: true } } } } },
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        if (order.status !== client_1.OrderStatus.CONFIRMED)
            throw new common_1.BadRequestException('Confirm the order first');
        if (order.items.some((i) => i.product.type === client_1.ProductType.PHYSICAL)) {
            throw new common_1.BadRequestException('Physical orders are completed by the carrier');
        }
        return this.markDelivered(id);
    }
    markDelivered(orderId, tx) {
        return this.run(tx, async (t) => {
            const order = await t.order.findUnique({
                where: { id: orderId }, include: { payment: true, shipment: true, store: { select: { ownerId: true } } },
            });
            if (!order || !order.payment)
                throw new common_1.NotFoundException('Order not found');
            if (order.status === client_1.OrderStatus.DELIVERED)
                return order;
            if (order.status !== client_1.OrderStatus.SHIPPED && order.status !== client_1.OrderStatus.CONFIRMED) {
                throw new common_1.BadRequestException(`Cannot deliver an order in status ${order.status}`);
            }
            const carrierFee = order.shipment?.carrierFeeMinor ?? 0;
            const sellerNet = Math.max(0, order.totalMinor - carrierFee - order.platformFeeMinor);
            if (order.payment.method === client_1.PaymentMethod.COD) {
                if (!order.shipment)
                    throw new common_1.BadRequestException('COD order has no shipment');
                await t.codSettlement.create({
                    data: {
                        orderId, carrierId: order.shipment.carrierId, storeId: order.storeId,
                        collectedMinor: order.totalMinor, carrierFeeMinor: carrierFee,
                        platformFeeMinor: order.platformFeeMinor, sellerNetMinor: sellerNet, currency: order.currency,
                    },
                });
            }
            else {
                await this.wallet.credit(t, order.store.ownerId, sellerNet, order.currency, client_1.WalletTxType.ESCROW_RELEASE, orderId);
                if (carrierFee > 0 && order.shipment) {
                    const carrier = await t.carrier.findUnique({ where: { id: order.shipment.carrierId }, select: { userId: true } });
                    if (carrier)
                        await this.wallet.credit(t, carrier.userId, carrierFee, order.currency, client_1.WalletTxType.CREDIT, `shipping:${orderId}`);
                }
            }
            await t.payment.update({ where: { orderId }, data: { status: client_1.PaymentStatus.PAID } });
            return t.order.update({ where: { id: orderId }, data: { status: client_1.OrderStatus.DELIVERED } });
        });
    }
    markReturned(orderId, tx) {
        return this.run(tx, async (t) => {
            const order = await t.order.findUnique({ where: { id: orderId }, include: { payment: true } });
            if (!order)
                throw new common_1.NotFoundException('Order not found');
            if (order.status === client_1.OrderStatus.RETURNED)
                return order;
            if (order.status !== client_1.OrderStatus.SHIPPED && order.status !== client_1.OrderStatus.CONFIRMED) {
                throw new common_1.BadRequestException(`Cannot return an order in status ${order.status}`);
            }
            await this.unwind(t, order, client_1.OrderStatus.RETURNED);
            return t.order.findUniqueOrThrow({ where: { id: orderId } });
        });
    }
    run(tx, fn) {
        return tx ? fn(tx) : this.prisma.$transaction(fn);
    }
    async unwind(t, order, status) {
        await this.restock(t, order.id);
        if (order.payment?.method === client_1.PaymentMethod.WALLET && order.payment.status === client_1.PaymentStatus.AUTHORIZED) {
            await this.wallet.credit(t, order.buyerId, order.totalMinor, order.currency, client_1.WalletTxType.CREDIT, `refund:${order.id}`);
            await t.payment.update({ where: { orderId: order.id }, data: { status: client_1.PaymentStatus.REFUNDED } });
        }
        else if (order.payment) {
            await t.payment.update({ where: { orderId: order.id }, data: { status: client_1.PaymentStatus.FAILED } });
        }
        await t.order.update({ where: { id: order.id }, data: { status } });
    }
    async takeStock(tx, l) {
        if (!l.stock)
            return;
        const res = l.stock === 'variant'
            ? await tx.productVariant.updateMany({ where: { id: l.variantId, stock: { gte: l.quantity } }, data: { stock: { decrement: l.quantity } } })
            : await tx.product.updateMany({ where: { id: l.productId, stock: { gte: l.quantity } }, data: { stock: { decrement: l.quantity } } });
        if (res.count === 0)
            throw new common_1.BadRequestException(`Not enough stock for "${l.title}"`);
    }
    async restock(tx, orderId) {
        const items = await tx.orderItem.findMany({ where: { orderId } });
        for (const i of items) {
            if (i.variantId) {
                await tx.productVariant.updateMany({ where: { id: i.variantId, stock: { not: null } }, data: { stock: { increment: i.quantity } } });
            }
            else {
                await tx.product.updateMany({ where: { id: i.productId, stock: { not: null } }, data: { stock: { increment: i.quantity } } });
            }
        }
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object, wallet_service_1.WalletService, config_1.ConfigService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map