import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Role, SettlementStatus, WalletTxType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { WalletService } from '../wallet/wallet.service';

@Injectable()
export class SettlementsService {
  constructor(private prisma: PrismaService, private wallet: WalletService) {}

  async mine(userId: string, role: string) {
    if (role === Role.CARRIER) {
      const carrier = await this.prisma.carrier.findUnique({ where: { userId }, select: { id: true } });
      if (!carrier) throw new NotFoundException('Carrier profile not found');
      return this.prisma.codSettlement.findMany({ where: { carrierId: carrier.id }, orderBy: { createdAt: 'desc' }, take: 100 });
    }
    const stores = await this.prisma.store.findMany({ where: { ownerId: userId }, select: { id: true } });
    return this.prisma.codSettlement.findMany({
      where: { storeId: { in: stores.map((s) => s.id) } }, orderBy: { createdAt: 'desc' }, take: 100,
    });
  }

  pending() {
    return this.prisma.codSettlement.findMany({
      where: { status: SettlementStatus.PENDING },
      include: { carrier: { select: { companyName: true } } },
      orderBy: { createdAt: 'asc' },
      take: 200,
    });
  }

  remit(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const claimed = await tx.codSettlement.updateMany({
        where: { id, status: SettlementStatus.PENDING },
        data: { status: SettlementStatus.REMITTED, remittedAt: new Date() },
      });
      if (claimed.count === 0) throw new ConflictException('Settlement not found or already remitted');
      const s = await tx.codSettlement.findUniqueOrThrow({ where: { id } });
      const store = await tx.store.findUniqueOrThrow({ where: { id: s.storeId }, select: { ownerId: true } });
      await this.wallet.credit(tx, store.ownerId, s.sellerNetMinor, s.currency, WalletTxType.CREDIT, `settlement:${s.id}`);
      return s;
    });
  }
}