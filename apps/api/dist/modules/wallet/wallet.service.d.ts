import { Prisma, WalletTxType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
export type Tx = Prisma.TransactionClient;
export declare class WalletService {
    private prisma;
    constructor(prisma: PrismaService);
    get(userId: string): Promise<any>;
    transactions(userId: string, page?: number): Promise<any>;
    debitForEscrow(tx: Tx, userId: string, amountMinor: number, currency: string, reference: string): Promise<void>;
    credit(tx: Tx, userId: string, amountMinor: number, currency: string | undefined, type: WalletTxType, reference?: string): Promise<void>;
    adminCredit(adminId: string, userId: string, amountMinor: number, reference: string): any;
}
