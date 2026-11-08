import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TopUpStatus, WalletTxType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { WalletService } from '../wallet/wallet.service';
import { StripeEvent, StripeService } from './stripe.service';

@Injectable()
export class TopUpsService {
  private log = new Logger(TopUpsService.name);

  constructor(
    private prisma: PrismaService, private stripe: StripeService,
    private wallet: WalletService, private config: ConfigService,
  ) {}

  async start(userId: string, amountMinor: number) {
    const wallet = await this.wallet.get(userId);
    const topUp = await this.prisma.topUp.create({
      data: { userId, provider: 'stripe', amountMinor, currency: wallet.currency },
    });
    const appUrl = this.config.get<string>('APP_URL') ?? 'http://localhost:3000';
    const session = await this.stripe.createCheckoutSession({
      topUpId: topUp.id, amountMinor, currency: wallet.currency,
      successUrl: `${appUrl}/wallet?topup=success`, cancelUrl: `${appUrl}/wallet?topup=cancelled`,
    });
    await this.prisma.topUp.update({ where: { id: topUp.id }, data: { providerRef: session.id } });
    return { topUpId: topUp.id, checkoutUrl: session.url };
  }

  async status(userId: string, id: string) {
    const t = await this.prisma.topUp.findFirst({ where: { id, userId }, select: { id: true, status: true, amountMinor: true, currency: true } });
    if (!t) throw new (await import('@nestjs/common')).NotFoundException('Top-up not found');
    return t;
  }

  async handleStripeEvent(event: StripeEvent) {
    const obj = event.data.object;
    const paidTypes = ['checkout.session.completed', 'checkout.session.async_payment_succeeded'];

    if (paidTypes.includes(event.type)) {
      if (obj.payment_status !== 'paid') return;
      const topUpId: string | undefined = obj.metadata?.topUpId ?? obj.client_reference_id;
      if (!topUpId) return;

      await this.prisma.$transaction(async (tx) => {
        const topUp = await tx.topUp.findUnique({ where: { id: topUpId } });
        if (!topUp || topUp.providerRef !== obj.id) return;
        const matches = obj.amount_total === topUp.amountMinor && String(obj.currency).toUpperCase() === topUp.currency;
        if (!matches) {
          this.log.error(`Top-up ${topUp.id} amount/currency mismatch`);
          await tx.topUp.updateMany({ where: { id: topUp.id, status: TopUpStatus.PENDING }, data: { status: TopUpStatus.FAILED } });
          return;
        }
        const claimed = await tx.topUp.updateMany({
          where: { id: topUp.id, status: TopUpStatus.PENDING }, data: { status: TopUpStatus.COMPLETED },
        });
        if (claimed.count === 1) {
          await this.wallet.credit(tx, topUp.userId, topUp.amountMinor, topUp.currency, WalletTxType.CREDIT, `topup:${topUp.id}`);
        }
      });
    } else if (event.type === 'checkout.session.expired') {
      const topUpId: string | undefined = obj.metadata?.topUpId;
      if (topUpId) await this.prisma.topUp.updateMany({ where: { id: topUpId, status: TopUpStatus.PENDING }, data: { status: TopUpStatus.FAILED } });
    }
  }
}