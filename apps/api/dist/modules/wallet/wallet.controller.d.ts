import { AuthUser } from '../auth/decorators/current-user.decorator';
import { WalletService } from './wallet.service';
declare class AdminCreditDto {
    userId: string;
    amountMinor: number;
    reference: string;
}
export declare class WalletController {
    private wallet;
    constructor(wallet: WalletService);
    me(user: AuthUser): Promise<any>;
    tx(user: AuthUser, page?: string): Promise<any>;
    adminCredit(admin: AuthUser, dto: AdminCreditDto): Promise<{
        success: boolean;
    }>;
}
export {};
