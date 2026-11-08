import { ConfigService } from '@nestjs/config';
export interface StripeEvent {
    type: string;
    data: {
        object: Record<string, any>;
    };
}
export declare class StripeService {
    private config;
    constructor(config: ConfigService);
    private secretKey;
    createCheckoutSession(p: {
        topUpId: string;
        amountMinor: number;
        currency: string;
        successUrl: string;
        cancelUrl: string;
    }): Promise<{
        id: string;
        url: string;
    }>;
    verifyWebhook(rawBody: Buffer | undefined, header: string | undefined): StripeEvent;
}
