import { Module } from '@nestjs/common';
import { WalletModule } from '../wallet/wallet.module';
import { PaymentsController } from './payments.controller';
import { PayoutsService } from './payouts.service';
import { StripeService } from './stripe.service';
import { TopUpsService } from './topups.service';

@Module({
  imports: [WalletModule],
  controllers: [PaymentsController],
  providers: [StripeService, TopUpsService, PayoutsService],
})
export class PaymentsModule {}