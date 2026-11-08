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
exports.SubscriptionGuard = exports.RequiresPlan = exports.PLAN_KEY = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
exports.PLAN_KEY = 'requires_plan';
const RequiresPlan = (audience, opts = {}) => (0, common_1.SetMetadata)(exports.PLAN_KEY, { audience: audience, ...opts });
exports.RequiresPlan = RequiresPlan;
let SubscriptionGuard = class SubscriptionGuard {
    constructor(reflector, config, prisma) {
        this.reflector = reflector;
        this.config = config;
        this.prisma = prisma;
    }
    async canActivate(ctx) {
        const meta = this.reflector.getAllAndOverride(exports.PLAN_KEY, [ctx.getHandler(), ctx.getClass()]);
        if (!meta || this.config.get('REQUIRE_SUBSCRIPTION') !== 'true')
            return true;
        const user = ctx.switchToHttp().getRequest().user;
        if (!user)
            return false;
        const now = new Date();
        const sub = await this.prisma.subscription.findFirst({
            where: {
                userId: user.id, status: client_1.SubscriptionStatus.ACTIVE, plan: { audience: meta.audience },
                OR: [{ endsAt: null }, { endsAt: { gt: now } }],
            },
            include: { plan: true },
        });
        if (!sub) {
            throw new common_1.HttpException({ message: 'An active subscription is required', code: 'SUBSCRIPTION_REQUIRED' }, common_1.HttpStatus.PAYMENT_REQUIRED);
        }
        if (meta.productLimit) {
            const max = sub.plan.features?.maxProducts;
            if (typeof max === 'number') {
                const count = await this.prisma.product.count({
                    where: { store: { ownerId: user.id }, status: { not: client_1.ProductStatus.ARCHIVED } },
                });
                if (count >= max) {
                    throw new common_1.HttpException({ message: `Your plan allows up to ${max} products`, code: 'PLAN_LIMIT_REACHED' }, common_1.HttpStatus.FORBIDDEN);
                }
            }
        }
        return true;
    }
};
exports.SubscriptionGuard = SubscriptionGuard;
exports.SubscriptionGuard = SubscriptionGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector, config_1.ConfigService, typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
], SubscriptionGuard);
//# sourceMappingURL=plan.guard.js.map