import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PlanAudience, Role, SubscriptionStatus, WalletTxType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { FxService } from './fx.service';

const addMonths = (d: Date, m: number) => { const x = new Date(d); x.setMonth(x.getMonth() + m); return x; };

@Injectable()
export class BillingService {
  constructor(private prisma: PrismaService, private fx: FxService) {}

  listPlans(audience?: string) {
    return this.prisma.plan.findMany({
      where: audience === 'SELLER' || audience === 'CARRIER' ? { audience: audience as PlanAudience } : {},
      orderBy: [{ audience: 'asc' }, { priceMinor: 'asc' }],
    });
  }

  async mine(userId: string) {
    const now = new Date();
    const subs = await this.prisma.subscription.findMany({
      where: { userId }, include: { plan: true }, orderBy: { startedAt: 'desc' }, take: 20,
    });
    return subs.map((s) => ({ ...s, active: s.status === SubscriptionStatus.ACTIVE && (!s.endsAt || s.endsAt > now) }));
  }

  async subscribe(userId: string, planKey: string) {
    const [user, plan, wallet] = await Promise.all([
      this.prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { role: true } }),
      this.prisma.plan.findUnique({ where: { key: planKey } }),
      this.prisma.wallet.findUnique({ where: { userId } }),
    ]);
    if (!plan) throw new NotFoundException('Plan not found');
    if (!wallet) throw new NotFoundException('Wallet not found');
    const allowed = plan.audience === PlanAudience.CARRIER ? user.role === Role.CARRIER : user.role === Role.SELLER || user.role === Role.CREATOR;
    if (!allowed) throw new ForbiddenException('This plan is not available for your account type');

    const price = await this.fx.convert(plan.priceMinor, plan.currency, wallet.currency);

    return this.prisma.$transaction(async (tx) => {
      if (price > 0) {
        const res = await tx.wallet.updateMany({
          where: { id: wallet.id, balanceMinor: { gte: price } }, data: { balanceMinor: { decrement: price } },
        });
        if (res.count === 0) throw new BadRequestException('Insufficient wallet balance. Top up your wallet first.');
        await tx.walletTransaction.create({
          data: { walletId: wallet.id, type: WalletTxType.DEBIT, amountMinor: price, reference: `subscription:${plan.key}` },
        });
      }
      const now = new Date();
      const current = await tx.subscription.findFirst({
        where: { userId, status: SubscriptionStatus.ACTIVE, plan: { audience: plan.audience }, OR: [{ endsAt: null }, { endsAt: { gt: now } }] },
        orderBy: { startedAt: 'desc' },
      });
      if (current && current.planId === plan.id) {
        return tx.subscription.update({
          where: { id: current.id }, data: { endsAt: addMonths(current.endsAt ?? now, plan.intervalMonths) }, include: { plan: true },
        });
      }
      if (current) await tx.subscription.update({ where: { id: current.id }, data: { status: SubscriptionStatus.CANCELLED, endsAt: now } });
      return tx.subscription.create({
        data: { userId, planId: plan.id, endsAt: addMonths(now, plan.intervalMonths) }, include: { plan: true },
      });
    });
  }
}