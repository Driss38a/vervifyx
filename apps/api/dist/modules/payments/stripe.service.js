"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const crypto_1 = require("crypto");
let StripeService = class StripeService {
    constructor(config) {
        this.config = config;
    }
    secretKey() {
        const key = this.config.get('STRIPE_SECRET_KEY');
        if (!key)
            throw new common_1.ServiceUnavailableException('Card payments are not configured');
        return key;
    }
    async createCheckoutSession(p) {
        const body = new URLSearchParams({
            mode: 'payment',
            success_url: p.successUrl,
            cancel_url: p.cancelUrl,
            client_reference_id: p.topUpId,
            'metadata[topUpId]': p.topUpId,
            'line_items[0][quantity]': '1',
            'line_items[0][price_data][currency]': p.currency.toLowerCase(),
            'line_items[0][price_data][unit_amount]': String(p.amountMinor),
            'line_items[0][price_data][product_data][name]': 'vervifyx wallet top-up',
        });
        const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
            method: 'POST',
            headers: { Authorization: `Bearer ${this.secretKey()}`, 'Content-Type': 'application/x-www-form-urlencoded' },
            body,
        });
        const data = (await res.json());
        if (!res.ok || !data.id || !data.url)
            throw new common_1.BadGatewayException(data.error?.message ?? 'Payment provider error');
        return { id: data.id, url: data.url };
    }
    verifyWebhook(rawBody, header) {
        const secret = this.config.get('STRIPE_WEBHOOK_SECRET');
        if (!secret)
            throw new common_1.ServiceUnavailableException('Webhook secret is not configured');
        if (!rawBody || !header)
            throw new common_1.BadRequestException('Missing signature');
        const parts = header.split(',').map((kv) => kv.split('='));
        const t = parts.find(([k]) => k === 't')?.[1];
        const signatures = parts.filter(([k]) => k === 'v1').map(([, v]) => v);
        if (!t || !signatures.length)
            throw new common_1.BadRequestException('Invalid signature header');
        if (Math.abs(Date.now() / 1000 - Number(t)) > 300)
            throw new common_1.BadRequestException('Signature timestamp too old');
        const expected = Buffer.from((0, crypto_1.createHmac)('sha256', secret).update(`${t}.${rawBody.toString('utf8')}`).digest('hex'));
        const ok = signatures.some((sig) => {
            const given = Buffer.from(sig);
            return given.length === expected.length && (0, crypto_1.timingSafeEqual)(given, expected);
        });
        if (!ok)
            throw new common_1.BadRequestException('Invalid signature');
        return JSON.parse(rawBody.toString('utf8'));
    }
};
exports.StripeService = StripeService;
exports.StripeService = StripeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], StripeService);
//# sourceMappingURL=stripe.service.js.map