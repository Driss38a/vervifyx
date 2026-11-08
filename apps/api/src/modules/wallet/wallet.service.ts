import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, WalletTxType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export type Tx = Prisma.TransactionClient;

@Injectable()
export class WalletService {
  constructor(private prisma: PrismaService) {}

  async get(userId: string) {
    const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) throw new NotFoundException('Wallet not found');
    return wallet;
  }

  async transactions(userId: string, page = 1) {
    const wallet = await this.get(userId);
    return this.prisma.walletTransaction.findMany({
      where: { walletId: wallet.id }, orderBy: { createdAt: 'desc' }, skip: (page - 1) * 30, take: 30,
    });
  }

  async debitForEscrow(tx: Tx, userId: string, amountMinor: number, currency: string, reference: string) {
    const wallet = await tx.wallet.findUnique({ where: { userId } });
    if (!wallet) throw new BadRequestException('Wallet not found');
    if (wallet.currency !== currency) throw new BadRequestException(`Your wallet is in ${wallet.currency}; this order is in ${currency}`);
    const res = await tx.wallet.updateMany({
      where: { id: wallet.id, balanceMinor: { gte: amountMinor } },
      data: { balanceMinor: { decrement: amountMinor } },
    });
    if (res.count === 0) throw new BadRequestException('Insufficient wallet balance');
    await tx.walletTransaction.create({
      data: { walletId: wallet.id, type: WalletTxType.ESCROW_HOLD, amountMinor, reference },
    });
  }

  async credit(tx: Tx, userId: string, amountMinor: number, currency: string | undefined, type: WalletTxType, reference?: string) {
    if (amountMinor <= 0) return;
    const wallet = await tx.wallet.findUnique({ where: { userId } });
    if (!wallet) throw new BadRequestException('Wallet not found');
    if (currency && wallet.currency !== currency) {
      throw new BadRequestException(`Wallet currency mismatch (${wallet.currency} vs ${currency})`);
    }
    await tx.wallet.update({ where: { id: wallet.id }, data: { balanceMinor: { increment: amountMinor } } });
    await tx.walletTransaction.create({ data: { walletId: wallet.id, type, amountMinor, reference } });
  }

  adminCredit(adminId: string, userId: string, amountMinor: number, reference: string) {
    return this.prisma.$transaction((tx) =>
      this.credit(tx, userId, amountMinor, undefined, WalletTxType.CREDIT, `admin:${adminId}:${reference}`));
  }
}