import { Body, Controller, Get, Headers, HttpCode, Param, Post, RawBodyRequest, Req, UseGuards } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { Role } from '@prisma/client';
import type { Request } from 'express';
import { AuthUser, CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PayoutPaidDto, PayoutRejectDto, PayoutRequestDto, TopUpDto } from './payments.dto';
import { PayoutsService } from './payouts.service';
import { StripeService } from './stripe.service';
import { TopUpsService } from './topups.service';

@Controller()
export class PaymentsController {
  constructor(private topups: TopUpsService, private payouts: PayoutsService, private stripe: StripeService) {}

  @UseGuards(JwtAuthGuard)
  @Post('payments/topups')
  topUp(@CurrentUser() user: AuthUser, @Body() dto: TopUpDto) { return this.topups.start(user.id, dto.amountMinor); }

  @UseGuards(JwtAuthGuard)
  @Get('payments/topups/:id')
  topUpStatus(@CurrentUser() user: AuthUser, @Param('id') id: string) { return this.topups.status(user.id, id); }

  @SkipThrottle()
  @HttpCode(200)
  @Post('payments/webhooks/stripe')
  async stripeWebhook(@Req() req: RawBodyRequest<Request>, @Headers('stripe-signature') signature?: string) {
    const event = this.stripe.verifyWebhook(req.rawBody, signature);
    await this.topups.handleStripeEvent(event);
    return { received: true };
  }

  @UseGuards(JwtAuthGuard)
  @Post('payouts')
  requestPayout(@CurrentUser() user: AuthUser, @Body() dto: PayoutRequestDto) { return this.payouts.request(user.id, dto); }

  @UseGuards(JwtAuthGuard)
  @Get('payouts/mine')
  myPayouts(@CurrentUser() user: AuthUser) { return this.payouts.mine(user.id); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('payouts/admin/pending')
  pendingPayouts() { return this.payouts.pending(); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(200)
  @Post('payouts/admin/:id/paid')
  paid(@Param('id') id: string, @Body() dto: PayoutPaidDto) { return this.payouts.markPaid(id, dto.reference); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(200)
  @Post('payouts/admin/:id/reject')
  reject(@Param('id') id: string, @Body() dto: PayoutRejectDto) { return this.payouts.reject(id, dto.note); }
}