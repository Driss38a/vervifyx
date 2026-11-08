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
exports.PayoutsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const wallet_service_1 = require("../wallet/wallet.service");
let PayoutsService = class PayoutsService {
    constructor(prisma, wallet, config) {
        this.prisma = prisma;
        this.wallet = wallet;
        this.config = config;
    }
    async request(userId, dto) {
        const min = Number(this.config.get('MIN_PAYOUT_MINOR') ?? 1000) || 1000;
        if (dto.amountMinor < min)
            throw new common_1.BadRequestException(`Minimum payout is ${min} (minor units)`);
        return this.prisma.$transaction(async (tx) => {
            const wallet = await tx.wallet.findUnique({ where: { userId } });
            if (!wallet)
                throw new common_1.NotFoundException('Wallet not found');
            const res = await tx.wallet.updateMany({
                where: { id: wallet.id, balanceMinor: { gte: dto.amountMinor } }, data: { balanceMinor: { decrement: dto.amountMinor } },
            });
            if (res.count === 0)
                throw new common_1.BadRequestException('Insufficient wallet balance');
            const payout = await tx.payoutRequest.create({
                data: { userId, amountMinor: dto.amountMinor, currency: wallet.currency, method: dto.method, destination: dto.destination },
            });
            await tx.walletTransaction.create({
                data: { walletId: wallet.id, type: client_1.WalletTxType.PAYOUT, amountMinor: dto.amountMinor, reference: `payout:${payout.id}` },
            });
            return payout;
        });
    }
    mine(userId) {
        return this.prisma.payoutRequest.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 50 });
    }
    pending() {
        return this.prisma.payoutRequest.findMany({
            where: { status: client_1.PayoutStatus.REQUESTED }, orderBy: { createdAt: 'asc' }, take: 200,
            include: { user: { select: { email: true, profile: { select: { displayName: true } } } } },
        });
    }
    async markPaid(id, reference) {
        const res = await this.prisma.payoutRequest.updateMany({
            where: { id, status: client_1.PayoutStatus.REQUESTED },
            data: { status: client_1.PayoutStatus.PAID, reference, processedAt: new Date() },
        });
        if (res.count === 0)
            throw new common_1.ConflictException('Payout not found or already processed');
        return { success: true };
    }
    reject(id, note) {
        return this.prisma.$transaction(async (tx) => {
            const res = await tx.payoutRequest.updateMany({
                where: { id, status: client_1.PayoutStatus.REQUESTED },
                data: { status: client_1.PayoutStatus.REJECTED, note: note ?? null, processedAt: new Date() },
            });
            if (res.count === 0)
                throw new common_1.ConflictException('Payout not found or already processed');
            const p = await tx.payoutRequest.findUniqueOrThrow({ where: { id } });
            await this.wallet.credit(tx, p.userId, p.amountMinor, p.currency, client_1.WalletTxType.CREDIT, `payout-refund:${p.id}`);
            return { success: true };
        });
    }
};
exports.PayoutsService = PayoutsService;
exports.PayoutsService = PayoutsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object, wallet_service_1.WalletService, config_1.ConfigService])
], PayoutsService);
//# sourceMappingURL=payouts.service.js.map