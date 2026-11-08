import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { WalletService } from '../wallet/wallet.service';
import { PayoutRequestDto } from './payments.dto';
export declare class PayoutsService {
    private prisma;
    private wallet;
    private config;
    constructor(prisma: PrismaService, wallet: WalletService, config: ConfigService);
    request(userId: string, dto: PayoutRequestDto): Promise<any>;
    mine(userId: string): any;
    pending(): any;
    markPaid(id: string, reference: string): Promise<{
        success: boolean;
    }>;
    reject(id: string, note?: string): any;
}
