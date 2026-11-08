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
exports.SettlementsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const wallet_service_1 = require("../wallet/wallet.service");
let SettlementsService = class SettlementsService {
    constructor(prisma, wallet) {
        this.prisma = prisma;
        this.wallet = wallet;
    }
    async mine(userId, role) {
        if (role === client_1.Role.CARRIER) {
            const carrier = await this.prisma.carrier.findUnique({ where: { userId }, select: { id: true } });
            if (!carrier)
                throw new common_1.NotFoundException('Carrier profile not found');
            return this.prisma.codSettlement.findMany({ where: { carrierId: carrier.id }, orderBy: { createdAt: 'desc' }, take: 100 });
        }
        const stores = await this.prisma.store.findMany({ where: { ownerId: userId }, select: { id: true } });
        return this.prisma.codSettlement.findMany({
            where: { storeId: { in: stores.map((s) => s.id) } }, orderBy: { createdAt: 'desc' }, take: 100,
        });
    }
    pending() {
        return this.prisma.codSettlement.findMany({
            where: { status: client_1.SettlementStatus.PENDING },
            include: { carrier: { select: { companyName: true } } },
            orderBy: { createdAt: 'asc' },
            take: 200,
        });
    }
    remit(id) {
        return this.prisma.$transaction(async (tx) => {
            const claimed = await tx.codSettlement.updateMany({
                where: { id, status: client_1.SettlementStatus.PENDING },
                data: { status: client_1.SettlementStatus.REMITTED, remittedAt: new Date() },
            });
            if (claimed.count === 0)
                throw new common_1.ConflictException('Settlement not found or already remitted');
            const s = await tx.codSettlement.findUniqueOrThrow({ where: { id } });
            const store = await tx.store.findUniqueOrThrow({ where: { id: s.storeId }, select: { ownerId: true } });
            await this.wallet.credit(tx, store.ownerId, s.sellerNetMinor, s.currency, client_1.WalletTxType.CREDIT, `settlement:${s.id}`);
            return s;
        });
    }
};
exports.SettlementsService = SettlementsService;
exports.SettlementsService = SettlementsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object, wallet_service_1.WalletService])
], SettlementsService);
//# sourceMappingURL=settlements.service.js.map