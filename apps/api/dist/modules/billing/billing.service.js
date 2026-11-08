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
exports.BillingService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const fx_service_1 = require("./fx.service");
const addMonths = (d, m) => { const x = new Date(d); x.setMonth(x.getMonth() + m); return x; };
let BillingService = class BillingService {
    constructor(prisma, fx) {
        this.prisma = prisma;
        this.fx = fx;
    }
    listPlans(audience) {
        return this.prisma.plan.findMany({
            where: audience === 'SELLER' || audience === 'CARRIER' ? { audience: audience } : {},
            orderBy: [{ audience: 'asc' }, { priceMinor: 'asc' }],
        });
    }
    async mine(userId) {
        const now = new Date();
        const subs = await this.prisma.subscription.findMany({
            where: { userId }, include: { plan: true }, orderBy: { startedAt: 'desc' }, take: 20,
        });
        return subs.map((s) => ({ ...s, active: s.status === client_1.SubscriptionStatus.ACTIVE && (!s.endsAt || s.endsAt > now) }));
    }
    async subscribe(userId, planKey) {
        const [user, plan, wallet] = await Promise.all([
            this.prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { role: true } }),
            this.prisma.plan.findUnique({ where: { key: planKey } }),
            this.prisma.wallet.findUnique({ where: { userId } }),
        ]);
        if (!plan)
            throw new common_1.NotFoundException('Plan not found');
        if (!wallet)
            throw new common_1.NotFoundException('Wallet not found');
        const allowed = plan.audience === client_1.PlanAudience.CARRIER ? user.role === client_1.Role.CARRIER : user.role === client_1.Role.SELLER || user.role === client_1.Role.CREATOR;
        if (!allowed)
            throw new common_1.ForbiddenException('This plan is not available for your account type');
        const price = await this.fx.convert(plan.priceMinor, plan.currency, wallet.currency);
        return this.prisma.$transaction(async (tx) => {
            if (price > 0) {
                const res = await tx.wallet.updateMany({
                    where: { id: wallet.id, balanceMinor: { gte: price } }, data: { balanceMinor: { decrement: price } },
                });
                if (res.count === 0)
                    throw new common_1.BadRequestException('Insufficient wallet balance. Top up your wallet first.');
                await tx.walletTransaction.create({
                    data: { walletId: wallet.id, type: client_1.WalletTxType.DEBIT, amountMinor: price, reference: `subscription:${plan.key}` },
                });
            }
            const now = new Date();
            const current = await tx.subscription.findFirst({
                where: { userId, status: client_1.SubscriptionStatus.ACTIVE, plan: { audience: plan.audience }, OR: [{ endsAt: null }, { endsAt: { gt: now } }] },
                orderBy: { startedAt: 'desc' },
            });
            if (current && current.planId === plan.id) {
                return tx.subscription.update({
                    where: { id: current.id }, data: { endsAt: addMonths(current.endsAt ?? now, plan.intervalMonths) }, include: { plan: true },
                });
            }
            if (current)
                await tx.subscription.update({ where: { id: current.id }, data: { status: client_1.SubscriptionStatus.CANCELLED, endsAt: now } });
            return tx.subscription.create({
                data: { userId, planId: plan.id, endsAt: addMonths(now, plan.intervalMonths) }, include: { plan: true },
            });
        });
    }
};
exports.BillingService = BillingService;
exports.BillingService = BillingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object, fx_service_1.FxService])
], BillingService);
//# sourceMappingURL=billing.service.js.map