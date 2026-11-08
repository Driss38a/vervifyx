import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  OrderStatus, PaymentMethod, PaymentStatus, Prisma, ProductStatus, ProductType, Role, StoreStatus, WalletTxType,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { Tx, WalletService } from '../wallet/wallet.service';
import { CreateOrderDto } from './orders.dto';

const json = (v: unknown) => v as Prisma.InputJsonValue;

const ORDER_INCLUDE = {
  items: true,
  payment: true,
  shipment: { select: { id: true, trackingCode: true, status: true, carrierId: true } },
} satisfies Prisma.OrderInclude;

interface Line {
  productId: string; variantId: string | null; title: string; variantName: string | null;
  unitPriceMinor: number; quantity: number; stock: 'variant' | 'product' | null;
}

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService, private wallet: WalletService, private config: ConfigService) {}

  async create(buyerId: string, dto: CreateOrderDto) {
    const products = await this.prisma.product.findMany({
      where: { id: { in: [...new Set(dto.items.map((i) => i.productId))] } },
      include: { variants: true, store: { include: { owner: { select: { wallet: { select: { currency: true } } } } } } },
    });
    const byId = new Map(products.map((p) => [p.id, p]));

    type Group = { store: (typeof products)[number]['store']; physical: boolean; currency: string; lines: Line[] };
    const groups = new Map<string, Group>();

    for (const item of dto.items) {
      const p = byId.get(item.productId);
      if (!p || p.status !== ProductStatus.ACTIVE || p.store.status !== StoreStatus.ACTIVE) {
        throw new BadRequestException('A product is no longer available');
      }
      if (p.store.ownerId === buyerId) throw new BadRequestException('You cannot buy from your own store');

      let variant: (typeof p.variants)[number] | null = null;
      if (p.variants.length) {
        variant = p.variants.find((v) => v.id === item.variantId) ?? null;
        if (!variant) throw new BadRequestException(`Select a valid option for "${p.title}"`);
      } else if (item.variantId) {
        throw new BadRequestException(`"${p.title}" has no options`);
      }

      const physical = p.type === ProductType.PHYSICAL;
      const key = `${p.storeId}:${physical ? 'P' : 'D'}`;
      let g = groups.get(key);
      if (!g) { g = { store: p.store, physical, currency: p.currency, lines: [] }; groups.set(key, g); }
      if (g.currency !== p.currency) throw new BadRequestException('Items from the same store must share one currency');

      g.lines.push({
        productId: p.id, variantId: variant?.id ?? null, title: p.title, variantName: variant?.name ?? null,
        unitPriceMinor: variant?.priceMinor ?? p.priceMinor, quantity: item.quantity,
        stock: variant ? (variant.stock !== null ? 'variant' : null) : (p.stock !== null ? 'product' : null),
      });
    }

    const method = dto.paymentMethod === 'COD' ? PaymentMethod.COD : PaymentMethod.WALLET;
    const address = dto.shippingAddress ? { ...dto.shippingAddress, country: dto.shippingAddress.country.toUpperCase() } : null;
    const bps = Number(this.config.get('PLATFORM_FEE_BPS') ?? 0) || 0;

    for (const g of groups.values()) {
      if (g.physical && !address) throw new BadRequestException('A shipping address is required for physical products');
      if (!g.physical && method === PaymentMethod.COD) throw new BadRequestException('Cash on delivery is only available for physical products');
      if (g.store.owner.wallet?.currency !== g.currency) {
        throw new BadRequestException(`"${g.store.name}" cannot receive payments in ${g.currency} yet`);
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

        for (const l of g.lines) await this.takeStock(tx, l);

        const order = await tx.order.create({
          data: {
            buyerId, storeId: g.store.id, currency: g.currency,
            subtotalMinor: subtotal, shippingFeeMinor: shipping, platformFeeMinor: platformFee, totalMinor: total,
            shippingAddress: json(g.physical ? address : {}), buyerNote: dto.note,
            items: { create: g.lines.map(({ stock: _stock, ...line }) => line) },
            payment: {
              create: {
                method, amountMinor: total, currency: g.currency,
                status: method === PaymentMethod.WALLET ? PaymentStatus.AUTHORIZED : PaymentStatus.PENDING,
              },
            },
          },
          include: ORDER_INCLUDE,
        });
        if (method === PaymentMethod.WALLET) await this.wallet.debitForEscrow(tx, buyerId, total, g.currency, order.id);
        created.push(order);
      }
      return created;
    });
  }

  mine(buyerId: string, page = 1) {
    return this.prisma.order.findMany({
      where: { buyerId }, include: ORDER_INCLUDE, orderBy: { createdAt: 'desc' }, skip: (page - 1) * 20, take: 20,
    });
  }

  async forStore(ownerId: string, storeId: string, status?: OrderStatus) {
    const store = await this.prisma.store.findFirst({ where: { id: storeId, ownerId }, select: { id: true } });
    if (!store) throw new NotFoundException('Store not found');
    return this.prisma.order.findMany({
      where: { storeId, ...(status ? { status } : {}) }, include: ORDER_INCLUDE, orderBy: { createdAt: 'desc' }, take: 100,
    });
  }

  async getOne(userId: string, role: string, id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id }, include: { ...ORDER_INCLUDE, store: { select: { ownerId: true, slug: true, name: true } } },
    });
    if (!order) throw new NotFoundException('Order not found');
    const allowed = order.buyerId === userId || order.store.ownerId === userId || role === Role.ADMIN || role === Role.MODERATOR;
    if (!allowed) throw new ForbiddenException();
    return order;
  }

  async confirm(ownerId: string, id: string) {
    const order = await this.prisma.order.findFirst({ where: { id, store: { ownerId } }, select: { id: true, status: true } });
    if (!order) throw new NotFoundException('Order not found');
    if (order.status !== OrderStatus.PENDING) throw new BadRequestException('Only pending orders can be confirmed');
    return this.prisma.order.update({ where: { id }, data: { status: OrderStatus.CONFIRMED }, include: ORDER_INCLUDE });
  }

  async cancel(userId: string, id: string) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id }, include: { payment: true, shipment: { select: { id: true } }, store: { select: { ownerId: true } } },
      });
      if (!order) throw new NotFoundException('Order not found');
      const isBuyer = order.buyerId === userId;
      const isSeller = order.store.ownerId === userId;
      if (!isBuyer && !isSeller) throw new ForbiddenException();
      if (order.shipment) throw new BadRequestException('A carrier is already assigned to this order');
      const cancellable = isBuyer ? [OrderStatus.PENDING] : [OrderStatus.PENDING, OrderStatus.CONFIRMED];
      if (!cancellable.includes(order.status as never)) throw new BadRequestException(`Order cannot be cancelled in status ${order.status}`);
      await this.unwind(tx, order, OrderStatus.CANCELLED);
      return tx.order.findUnique({ where: { id }, include: ORDER_INCLUDE });
    });
  }

  async complete(ownerId: string, id: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, store: { ownerId } },
      include: { items: { include: { product: { select: { type: true } } } } },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.status !== OrderStatus.CONFIRMED) throw new BadRequestException('Confirm the order first');
    if (order.items.some((i) => i.product.type === ProductType.PHYSICAL)) {
      throw new BadRequestException('Physical orders are completed by the carrier');
    }
    return this.markDelivered(id);
  }

  markDelivered(orderId: string, tx?: Tx) {
    return this.run(tx, async (t) => {
      const order = await t.order.findUnique({
        where: { id: orderId }, include: { payment: true, shipment: true, store: { select: { ownerId: true } } },
      });
      if (!order || !order.payment) throw new NotFoundException('Order not found');
      if (order.status === OrderStatus.DELIVERED) return order;
      if (order.status !== OrderStatus.SHIPPED && order.status !== OrderStatus.CONFIRMED) {
        throw new BadRequestException(`Cannot deliver an order in status ${order.status}`);
      }

      const carrierFee = order.shipment?.carrierFeeMinor ?? 0;
      const sellerNet = Math.max(0, order.totalMinor - carrierFee - order.platformFeeMinor);

      if (order.payment.method === PaymentMethod.COD) {
        if (!order.shipment) throw new BadRequestException('COD order has no shipment');
        await t.codSettlement.create({
          data: {
            orderId, carrierId: order.shipment.carrierId, storeId: order.storeId,
            collectedMinor: order.totalMinor, carrierFeeMinor: carrierFee,
            platformFeeMinor: order.platformFeeMinor, sellerNetMinor: sellerNet, currency: order.currency,
          },
        });
      } else {
        await this.wallet.credit(t, order.store.ownerId, sellerNet, order.currency, WalletTxType.ESCROW_RELEASE, orderId);
        if (carrierFee > 0 && order.shipment) {
          const carrier = await t.carrier.findUnique({ where: { id: order.shipment.carrierId }, select: { userId: true } });
          if (carrier) await this.wallet.credit(t, carrier.userId, carrierFee, order.currency, WalletTxType.CREDIT, `shipping:${orderId}`);
        }
      }
      await t.payment.update({ where: { orderId }, data: { status: PaymentStatus.PAID } });
      return t.order.update({ where: { id: orderId }, data: { status: OrderStatus.DELIVERED } });
    });
  }

  markReturned(orderId: string, tx?: Tx) {
    return this.run(tx, async (t) => {
      const order = await t.order.findUnique({ where: { id: orderId }, include: { payment: true } });
      if (!order) throw new NotFoundException('Order not found');
      if (order.status === OrderStatus.RETURNED) return order;
      if (order.status !== OrderStatus.SHIPPED && order.status !== OrderStatus.CONFIRMED) {
        throw new BadRequestException(`Cannot return an order in status ${order.status}`);
      }
      await this.unwind(t, order, OrderStatus.RETURNED);
      return t.order.findUniqueOrThrow({ where: { id: orderId } });
    });
  }

  private run<T>(tx: Tx | undefined, fn: (t: Tx) => Promise<T>): Promise<T> {
    return tx ? fn(tx) : this.prisma.$transaction(fn);
  }

  private async unwind(
    t: Tx, order: { id: string; buyerId: string; currency: string; totalMinor: number; payment: { method: PaymentMethod; status: PaymentStatus } | null },
    status: OrderStatus,
  ) {
    await this.restock(t, order.id);
    if (order.payment?.method === PaymentMethod.WALLET && order.payment.status === PaymentStatus.AUTHORIZED) {
      await this.wallet.credit(t, order.buyerId, order.totalMinor, order.currency, WalletTxType.CREDIT, `refund:${order.id}`);
      await t.payment.update({ where: { orderId: order.id }, data: { status: PaymentStatus.REFUNDED } });
    } else if (order.payment) {
      await t.payment.update({ where: { orderId: order.id }, data: { status: PaymentStatus.FAILED } });
    }
    await t.order.update({ where: { id: order.id }, data: { status } });
  }

  private async takeStock(tx: Tx, l: Line) {
    if (!l.stock) return;
    const res = l.stock === 'variant'
      ? await tx.productVariant.updateMany({ where: { id: l.variantId!, stock: { gte: l.quantity } }, data: { stock: { decrement: l.quantity } } })
      : await tx.product.updateMany({ where: { id: l.productId, stock: { gte: l.quantity } }, data: { stock: { decrement: l.quantity } } });
    if (res.count === 0) throw new BadRequestException(`Not enough stock for "${l.title}"`);
  }

  private async restock(tx: Tx, orderId: string) {
    const items = await tx.orderItem.findMany({ where: { orderId } });
    for (const i of items) {
      if (i.variantId) {
        await tx.productVariant.updateMany({ where: { id: i.variantId, stock: { not: null } }, data: { stock: { increment: i.quantity } } });
      } else {
        await tx.product.updateMany({ where: { id: i.productId, stock: { not: null } }, data: { stock: { increment: i.quantity } } });
      }
    }
  }
}