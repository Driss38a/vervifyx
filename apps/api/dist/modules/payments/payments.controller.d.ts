import { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { AuthUser } from '../auth/decorators/current-user.decorator';
import { PayoutPaidDto, PayoutRejectDto, PayoutRequestDto, TopUpDto } from './payments.dto';
import { PayoutsService } from './payouts.service';
import { StripeService } from './stripe.service';
import { TopUpsService } from './topups.service';
export declare class PaymentsController {
    private topups;
    private payouts;
    private stripe;
    constructor(topups: TopUpsService, payouts: PayoutsService, stripe: StripeService);
    topUp(user: AuthUser, dto: TopUpDto): Promise<{
        topUpId: any;
        checkoutUrl: string;
    }>;
    topUpStatus(user: AuthUser, id: string): Promise<any>;
    stripeWebhook(req: RawBodyRequest<Request>, signature?: string): Promise<{
        received: boolean;
    }>;
    requestPayout(user: AuthUser, dto: PayoutRequestDto): Promise<any>;
    myPayouts(user: AuthUser): any;
    pendingPayouts(): any;
    paid(id: string, dto: PayoutPaidDto): Promise<{
        success: boolean;
    }>;
    reject(id: string, dto: PayoutRejectDto): any;
}
