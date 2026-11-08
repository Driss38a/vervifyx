import { PrismaService } from '../../prisma/prisma.service';
import { FxService } from './fx.service';
export declare class BillingService {
    private prisma;
    private fx;
    constructor(prisma: PrismaService, fx: FxService);
    listPlans(audience?: string): any;
    mine(userId: string): Promise<any>;
    subscribe(userId: string, planKey: string): Promise<any>;
}
