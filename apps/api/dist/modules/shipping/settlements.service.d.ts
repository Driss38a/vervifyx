import { PrismaService } from '../../prisma/prisma.service';
import { WalletService } from '../wallet/wallet.service';
export declare class SettlementsService {
    private prisma;
    private wallet;
    constructor(prisma: PrismaService, wallet: WalletService);
    mine(userId: string, role: string): Promise<any>;
    pending(): any;
    remit(id: string): any;
}
