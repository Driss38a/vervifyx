import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import {
  CarrierStatus, OrderStatus, PaymentMethod, Prisma, ProductType, ShipmentStatus,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ModerationService } from '../moderation/moderation.service';
import { OrdersService } from '../orders/orders.service';
import { AssignDto, RegisterCarrierDto, SetZonesDto, ShipmentEventDto } from './shipping.dto';
import { BALANCE_TOLERANCE, NEUTRAL_RATING, NEWCOMER_MIN_FINISHED, WEIGHTS, pickBalanced, rankCarriers } from './ranking';

const DAY = 24 * 60 * 60 * 1000;

const TRANSITIONS: Record<ShipmentStatus, ShipmentStatus[]> = {
  CREATED: ['PICKED_UP'],
  PICKED_UP: ['IN_TRANSIT', 'OUT_FOR_DELIVERY'],
  IN_TRANSIT: ['OUT_FOR_DELIVERY', 'FAILED'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'FAILED'],
  FAILED: ['OUT_FOR_DELIVERY', 'RETURNED'],
  DELIVERED: [],
  RETURNED: [],
};

@Injectable()
export class ShippingService {
  constructor(
    private prisma: PrismaService,
    private moderation: ModerationService,
    private orders: OrdersService,
  ) {}

  async register(userId: string, dto: RegisterCarrierDto) {
    if (await this.prisma.carrier.findUnique({ where: { userId }, select: { id: true } })) {
      throw new ConflictException('You already have a carrier profile');
    }
    if (this.moderation.screenText(dto.companyName).decision === 'REJECT') {
      throw new BadRequestException('Company name violates the marketplace policy');
    }
    return this.prisma.carrier.create({ data: { userId, companyName: dto.companyName, countries: [] } });
  }

  async myCarrier(userId: string) {
    const carrier = await this.prisma.carrier.findUnique({ where: { userId }, include: { zones: true } });
    if (!carrier) throw new NotFoundException('Carrier profile not found');
    return carrier;
  }

  async setZones(userId: string, dto: SetZonesDto) {
    const carrier = await this.prisma.carrier.findUnique({ where: { userId }, select: { id: true } });
    if (!carrier) throw new NotFoundException('Carrier profile not found');
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

  setStatus(id: string, status: 'ACTIVE' | 'SUSPENDED') {
    return this.prisma.carrier.update({ where: { id }, data: { status: status as CarrierStatus } });
  }

  listPublic(country?: string) {
    return this.prisma.carrier.findMany({
      where: { status: CarrierStatus.ACTIVE, ...(country ? { countries: { has: country.toUpperCase() } } : {}) },
      select: { id: true, companyName: true, countries: true, ratingAvg: true },
      orderBy: { companyName: 'asc' },
      take: 100,
    });
  }

  rankingPolicy() {
    return {
      weights: WEIGHTS,
      rules: [
        'Ranking uses only price, delivery speed, rating and reliability.',
        'Subscription tier never changes a carrier\'s rank.',
        `Carriers with fewer than ${NEWCOMER_MIN_FINISHED} finished deliveries get a neutral rating (${NEUTRAL_RATING}/5) so newcomers are not buried.`,
        `Automatic assignment spreads orders among carriers within ${BALANCE_TOLERANCE * 100}% of the best score, favouring the one with the lightest recent load.`,
      ],
    };
  }

  async ratesForOrder(ownerId: string, orderId: string) {
    const order = await this.sellerOrder(ownerId, orderId);
    return this.computeRates(order);
  }

  async assign(ownerId: string, orderId: string, dto: AssignDto) {
    const order = await this.sellerOrder(ownerId, orderId);
    if (order.shipment) throw new ConflictException('A carrier is already assigned');
    if (order.status !== OrderStatus.CONFIRMED) throw new BadRequestException('Confirm the order before choosing a carrier');
    if (!order.items.some((i) => i.product.type === ProductType.PHYSICAL)) throw new BadRequestException('This order needs no shipping');

    const ranked = await this.computeRates(order);
    if (!ranked.length) throw new BadRequestException('No carrier serves this destination in this currency');

    let chosen = ranked[0];
    if (dto.mode === 'MANUAL') {
      if (!dto.carrierId) throw new BadRequestException('carrierId is required in MANUAL mode');
      const found = ranked.find((r) => r.carrierId === dto.carrierId);
      if (!found) throw new BadRequestException('This carrier is not available for the order');
      chosen = found;
    } else {
      chosen = pickBalanced(ranked) ?? ranked[0];
    }
    if (chosen.priceMinor + order.platformFeeMinor > order.totalMinor) {
      throw new BadRequestException('Carrier fee exceeds the order value; choose a cheaper option');
    }

    return this.prisma.shipment.create({
      data: {
        orderId, carrierId: chosen.carrierId, currency: order.currency,
        trackingCode: `VFX-${randomBytes(5).toString('hex').toUpperCase()}`,
        carrierFeeMinor: chosen.priceMinor,
        codAmountMinor: order.payment?.method === PaymentMethod.COD ? order.totalMinor : null,
        events: { create: { status: ShipmentStatus.CREATED, note: 'Carrier assigned' } },
      },
      include: { events: true },
    });
  }

  async carrierShipments(userId: string) {
    return this.prisma.shipment.findMany({
      where: { carrier: { userId }, status: { notIn: [ShipmentStatus.DELIVERED, ShipmentStatus.RETURNED] } },
      include: { order: { select: { id: true, totalMinor: true, currency: true, shippingAddress: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async addEvent(userId: string, shipmentId: string, dto: ShipmentEventDto) {
    return this.prisma.$transaction(async (tx) => {
      const shipment = await tx.shipment.findFirst({
        where: { id: shipmentId, carrier: { userId, status: CarrierStatus.ACTIVE } },
      });
      if (!shipment) throw new NotFoundException('Shipment not found');
      if (!TRANSITIONS[shipment.status].includes(dto.status)) {
        throw new BadRequestException(`Cannot move from ${shipment.status} to ${dto.status}`);
      }
      await tx.shipment.update({ where: { id: shipmentId }, data: { status: dto.status } });
      await tx.trackingEvent.create({ data: { shipmentId, status: dto.status, note: dto.note } });

      if (dto.status === ShipmentStatus.PICKED_UP) {
        await tx.order.updateMany({ where: { id: shipment.orderId, status: OrderStatus.CONFIRMED }, data: { status: OrderStatus.SHIPPED } });
      } else if (dto.status === ShipmentStatus.DELIVERED) {
        await this.orders.markDelivered(shipment.orderId, tx);
      } else if (dto.status === ShipmentStatus.RETURNED) {
        await this.orders.markReturned(shipment.orderId, tx);
      }
      return tx.shipment.findUnique({ where: { id: shipmentId }, include: { events: { orderBy: { createdAt: 'asc' } } } });
    });
  }

  async track(code: string) {
    const shipment = await this.prisma.shipment.findUnique({
      where: { trackingCode: code.toUpperCase() },
      select: { trackingCode: true, status: true, createdAt: true, carrier: { select: { companyName: true } },
        events: { select: { status: true, note: true, createdAt: true }, orderBy: { createdAt: 'asc' } } },
    });
    if (!shipment) throw new NotFoundException('Tracking code not found');
    return shipment;
  }

  private sellerOrder(ownerId: string, orderId: string) {
    return this.prisma.order.findFirst({
      where: { id: orderId, store: { ownerId } },
      include: { payment: true, shipment: true, items: { include: { product: { select: { type: true } } } } },
    }).then((o) => {
      if (!o) throw new NotFoundException('Order not found');
      return o;
    });
  }

  private async computeRates(order: { currency: string; shippingAddress: Prisma.JsonValue; payment: { method: PaymentMethod } | null }) {
    const addr = order.shippingAddress as { country?: string; region?: string } | null;
    const country = addr?.country?.toUpperCase();
    if (!country) throw new BadRequestException('Order has no destination country');
    const walletPaid = order.payment?.method === PaymentMethod.WALLET;

    const carriers = await this.prisma.carrier.findMany({
      where: { status: CarrierStatus.ACTIVE, countries: { has: country } },
      include: {
        zones: { where: { country, currency: order.currency } },
        user: { select: { wallet: { select: { currency: true } } } },
      },
    });
    if (!carriers.length) return [];

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
      if (!zone) continue;
      if (walletPaid && c.user.wallet?.currency !== order.currency) continue;

      const count = (st: ShipmentStatus) => byStatus.find((r) => r.carrierId === c.id && r.status === st)?._count._all ?? 0;
      const delivered = count(ShipmentStatus.DELIVERED);
      const finished = delivered + count(ShipmentStatus.RETURNED) + count(ShipmentStatus.FAILED);
      candidates.push({
        meta: { companyName: c.companyName, zoneId: zone.id, currency: zone.currency },
        input: {
          carrierId: c.id, priceMinor: zone.priceMinor, etaDays: zone.etaDays, ratingAvg: c.ratingAvg,
          finished, delivered, shipments30d: recent.find((r) => r.carrierId === c.id)?._count._all ?? 0,
        },
      });
    }

    const ranked = rankCarriers(candidates.map((c) => c.input));
    return ranked.map((r) => ({ ...r, ...candidates.find((c) => c.input.carrierId === r.carrierId)!.meta }));
  }
}