import { Module } from '@nestjs/common';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { FxService } from './fx.service';
import { SubscriptionGuard } from './plan.guard';

@Module({
  controllers: [BillingController],
  providers: [BillingService, FxService, SubscriptionGuard],
  exports: [BillingService, FxService, SubscriptionGuard],
})
export class BillingModule {}