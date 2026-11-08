import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { WalletService } from '../wallet/wallet.service';
import { StripeEvent, StripeService } from './stripe.service';
export declare class TopUpsService {
    private prisma;
    private stripe;
    private wallet;
    private config;
    private log;
    constructor(prisma: PrismaService, stripe: StripeService, wallet: WalletService, config: ConfigService);
    start(userId: string, amountMinor: number): Promise<{
        topUpId: any;
        checkoutUrl: string;
    }>;
    status(userId: string, id: string): Promise<any>;
    handleStripeEvent(event: StripeEvent): Promise<void>;
}
