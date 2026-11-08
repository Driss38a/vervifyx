import { BadGatewayException, BadRequestException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'crypto';

export interface StripeEvent {
  type: string;
  data: { object: Record<string, any> };
}

@Injectable()
export class StripeService {
  constructor(private config: ConfigService) {}

  private secretKey(): string {
    const key = this.config.get<string>('STRIPE_SECRET_KEY');
    if (!key) throw new ServiceUnavailableException('Card payments are not configured');
    return key;
  }

  async createCheckoutSession(p: { topUpId: string; amountMinor: number; currency: string; successUrl: string; cancelUrl: string }) {
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
    const data = (await res.json()) as { id?: string; url?: string; error?: { message?: string } };
    if (!res.ok || !data.id || !data.url) throw new BadGatewayException(data.error?.message ?? 'Payment provider error');
    return { id: data.id, url: data.url };
  }

  verifyWebhook(rawBody: Buffer | undefined, header: string | undefined): StripeEvent {
    const secret = this.config.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!secret) throw new ServiceUnavailableException('Webhook secret is not configured');
    if (!rawBody || !header) throw new BadRequestException('Missing signature');

    const parts = header.split(',').map((kv) => kv.split('=') as [string, string]);
    const t = parts.find(([k]) => k === 't')?.[1];
    const signatures = parts.filter(([k]) => k === 'v1').map(([, v]) => v);
    if (!t || !signatures.length) throw new BadRequestException('Invalid signature header');
    if (Math.abs(Date.now() / 1000 - Number(t)) > 300) throw new BadRequestException('Signature timestamp too old');

    const expected = Buffer.from(createHmac('sha256', secret).update(`${t}.${rawBody.toString('utf8')}`).digest('hex'));
    const ok = signatures.some((sig) => {
      const given = Buffer.from(sig);
      return given.length === expected.length && timingSafeEqual(given, expected);
    });
    if (!ok) throw new BadRequestException('Invalid signature');
    return JSON.parse(rawBody.toString('utf8')) as StripeEvent;
  }
}