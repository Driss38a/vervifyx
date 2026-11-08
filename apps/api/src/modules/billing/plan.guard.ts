import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable, SetMetadata } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { PlanAudience, ProductStatus, SubscriptionStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export const PLAN_KEY = 'requires_plan';
export interface PlanMeta { audience: PlanAudience; productLimit?: boolean }

export const RequiresPlan = (audience: 'SELLER' | 'CARRIER', opts: { productLimit?: boolean } = {}) =>
  SetMetadata(PLAN_KEY, { audience: audience as PlanAudience, ...opts } satisfies PlanMeta);

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(private reflector: Reflector, private config: ConfigService, private prisma: PrismaService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const meta = this.reflector.getAllAndOverride<PlanMeta | undefined>(PLAN_KEY, [ctx.getHandler(), ctx.getClass()]);
    if (!meta || this.config.get('REQUIRE_SUBSCRIPTION') !== 'true') return true;

    const user = ctx.switchToHttp().getRequest().user as { id: string } | undefined;
    if (!user) return false;

    const now = new Date();
    const sub = await this.prisma.subscription.findFirst({
      where: {
        userId: user.id, status: SubscriptionStatus.ACTIVE, plan: { audience: meta.audience },
        OR: [{ endsAt: null }, { endsAt: { gt: now } }],
      },
      include: { plan: true },
    });
    if (!sub) {
      throw new HttpException({ message: 'An active subscription is required', code: 'SUBSCRIPTION_REQUIRED' }, HttpStatus.PAYMENT_REQUIRED);
    }

    if (meta.productLimit) {
      const max = (sub.plan.features as { maxProducts?: unknown } | null)?.maxProducts;
      if (typeof max === 'number') {
        const count = await this.prisma.product.count({
          where: { store: { ownerId: user.id }, status: { not: ProductStatus.ARCHIVED } },
        });
        if (count >= max) {
          throw new HttpException({ message: `Your plan allows up to ${max} products`, code: 'PLAN_LIMIT_REACHED' }, HttpStatus.FORBIDDEN);
        }
      }
    }
    return true;
  }
}