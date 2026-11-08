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
exports.WalletService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
let WalletService = class WalletService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async get(userId) {
        const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
        if (!wallet)
            throw new common_1.NotFoundException('Wallet not found');
        return wallet;
    }
    async transactions(userId, page = 1) {
        const wallet = await this.get(userId);
        return this.prisma.walletTransaction.findMany({
            where: { walletId: wallet.id }, orderBy: { createdAt: 'desc' }, skip: (page - 1) * 30, take: 30,
        });
    }
    async debitForEscrow(tx, userId, amountMinor, currency, reference) {
        const wallet = await tx.wallet.findUnique({ where: { userId } });
        if (!wallet)
            throw new common_1.BadRequestException('Wallet not found');
        if (wallet.currency !== currency)
            throw new common_1.BadRequestException(`Your wallet is in ${wallet.currency}; this order is in ${currency}`);
        const res = await tx.wallet.updateMany({
            where: { id: wallet.id, balanceMinor: { gte: amountMinor } },
            data: { balanceMinor: { decrement: amountMinor } },
        });
        if (res.count === 0)
            throw new common_1.BadRequestException('Insufficient wallet balance');
        await tx.walletTransaction.create({
            data: { walletId: wallet.id, type: client_1.WalletTxType.ESCROW_HOLD, amountMinor, reference },
        });
    }
    async credit(tx, userId, amountMinor, currency, type, reference) {
        if (amountMinor <= 0)
            return;
        const wallet = await tx.wallet.findUnique({ where: { userId } });
        if (!wallet)
            throw new common_1.BadRequestException('Wallet not found');
        if (currency && wallet.currency !== currency) {
            throw new common_1.BadRequestException(`Wallet currency mismatch (${wallet.currency} vs ${currency})`);
        }
        await tx.wallet.update({ where: { id: wallet.id }, data: { balanceMinor: { increment: amountMinor } } });
        await tx.walletTransaction.create({ data: { walletId: wallet.id, type, amountMinor, reference } });
    }
    adminCredit(adminId, userId, amountMinor, reference) {
        return this.prisma.$transaction((tx) => this.credit(tx, userId, amountMinor, undefined, client_1.WalletTxType.CREDIT, `admin:${adminId}:${reference}`));
    }
};
exports.WalletService = WalletService;
exports.WalletService = WalletService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
], WalletService);
//# sourceMappingURL=wallet.service.js.map