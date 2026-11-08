import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PayoutStatus, WalletTxType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { WalletService } from '../wallet/wallet.service';
import { PayoutRequestDto } from './payments.dto';

@Injectable()
export class PayoutsService {
  constructor(private prisma: PrismaService, private wallet: WalletService, private config: ConfigService) {}

  async request(userId: string, dto: PayoutRequestDto) {
    const min = Number(this.config.get('MIN_PAYOUT_MINOR') ?? 1000) || 1000;
    if (dto.amountMinor < min) throw new BadRequestException(`Minimum payout is ${min} (minor units)`);

    return this.prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { userId } });
      if (!wallet) throw new NotFoundException('Wallet not found');
      const res = await tx.wallet.updateMany({
        where: { id: wallet.id, balanceMinor: { gte: dto.amountMinor } }, data: { balanceMinor: { decrement: dto.amountMinor } },
      });
      if (res.count === 0) throw new BadRequestException('Insufficient wallet balance');
      const payout = await tx.payoutRequest.create({
        data: { userId, amountMinor: dto.amountMinor, currency: wallet.currency, method: dto.method, destination: dto.destination },
      });
      await tx.walletTransaction.create({
        data: { walletId: wallet.id, type: WalletTxType.PAYOUT, amountMinor: dto.amountMinor, reference: `payout:${payout.id}` },
      });
      return payout;
    });
  }

  mine(userId: string) {
    return this.prisma.payoutRequest.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 50 });
  }

  pending() {
    return this.prisma.payoutRequest.findMany({
      where: { status: PayoutStatus.REQUESTED }, orderBy: { createdAt: 'asc' }, take: 200,
      include: { user: { select: { email: true, profile: { select: { displayName: true } } } } },
    });
  }

  async markPaid(id: string, reference: string) {
    const res = await this.prisma.payoutRequest.updateMany({
      where: { id, status: PayoutStatus.REQUESTED },
      data: { status: PayoutStatus.PAID, reference, processedAt: new Date() },
    });
    if (res.count === 0) throw new ConflictException('Payout not found or already processed');
    return { success: true };
  }

  reject(id: string, note?: string) {
    return this.prisma.$transaction(async (tx) => {
      const res = await tx.payoutRequest.updateMany({
        where: { id, status: PayoutStatus.REQUESTED },
        data: { status: PayoutStatus.REJECTED, note: note ?? null, processedAt: new Date() },
      });
      if (res.count === 0) throw new ConflictException('Payout not found or already processed');
      const p = await tx.payoutRequest.findUniqueOrThrow({ where: { id } });
      await this.wallet.credit(tx, p.userId, p.amountMinor, p.currency, WalletTxType.CREDIT, `payout-refund:${p.id}`);
      return { success: true };
    });
  }
}