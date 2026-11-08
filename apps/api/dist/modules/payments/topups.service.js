"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var TopUpsService_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TopUpsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const wallet_service_1 = require("../wallet/wallet.service");
const stripe_service_1 = require("./stripe.service");
let TopUpsService = TopUpsService_1 = class TopUpsService {
    constructor(prisma, stripe, wallet, config) {
        this.prisma = prisma;
        this.stripe = stripe;
        this.wallet = wallet;
        this.config = config;
        this.log = new common_1.Logger(TopUpsService_1.name);
    }
    async start(userId, amountMinor) {
        const wallet = await this.wallet.get(userId);
        const topUp = await this.prisma.topUp.create({
            data: { userId, provider: 'stripe', amountMinor, currency: wallet.currency },
        });
        const appUrl = this.config.get('APP_URL') ?? 'http://localhost:3000';
        const session = await this.stripe.createCheckoutSession({
            topUpId: topUp.id, amountMinor, currency: wallet.currency,
            successUrl: `${appUrl}/wallet?topup=success`, cancelUrl: `${appUrl}/wallet?topup=cancelled`,
        });
        await this.prisma.topUp.update({ where: { id: topUp.id }, data: { providerRef: session.id } });
        return { topUpId: topUp.id, checkoutUrl: session.url };
    }
    async status(userId, id) {
        const t = await this.prisma.topUp.findFirst({ where: { id, userId }, select: { id: true, status: true, amountMinor: true, currency: true } });
        if (!t)
            throw new (await Promise.resolve().then(() => __importStar(require('@nestjs/common')))).NotFoundException('Top-up not found');
        return t;
    }
    async handleStripeEvent(event) {
        const obj = event.data.object;
        const paidTypes = ['checkout.session.completed', 'checkout.session.async_payment_succeeded'];
        if (paidTypes.includes(event.type)) {
            if (obj.payment_status !== 'paid')
                return;
            const topUpId = obj.metadata?.topUpId ?? obj.client_reference_id;
            if (!topUpId)
                return;
            await this.prisma.$transaction(async (tx) => {
                const topUp = await tx.topUp.findUnique({ where: { id: topUpId } });
                if (!topUp || topUp.providerRef !== obj.id)
                    return;
                const matches = obj.amount_total === topUp.amountMinor && String(obj.currency).toUpperCase() === topUp.currency;
                if (!matches) {
                    this.log.error(`Top-up ${topUp.id} amount/currency mismatch`);
                    await tx.topUp.updateMany({ where: { id: topUp.id, status: client_1.TopUpStatus.PENDING }, data: { status: client_1.TopUpStatus.FAILED } });
                    return;
                }
                const claimed = await tx.topUp.updateMany({
                    where: { id: topUp.id, status: client_1.TopUpStatus.PENDING }, data: { status: client_1.TopUpStatus.COMPLETED },
                });
                if (claimed.count === 1) {
                    await this.wallet.credit(tx, topUp.userId, topUp.amountMinor, topUp.currency, client_1.WalletTxType.CREDIT, `topup:${topUp.id}`);
                }
            });
        }
        else if (event.type === 'checkout.session.expired') {
            const topUpId = obj.metadata?.topUpId;
            if (topUpId)
                await this.prisma.topUp.updateMany({ where: { id: topUpId, status: client_1.TopUpStatus.PENDING }, data: { status: client_1.TopUpStatus.FAILED } });
        }
    }
};
exports.TopUpsService = TopUpsService;
exports.TopUpsService = TopUpsService = TopUpsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object, stripe_service_1.StripeService,
        wallet_service_1.WalletService, config_1.ConfigService])
], TopUpsService);
//# sourceMappingURL=topups.service.js.map