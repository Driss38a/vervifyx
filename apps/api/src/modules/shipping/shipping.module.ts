import { Module } from '@nestjs/common';
import { OrdersModule } from '../orders/orders.module';
import { WalletModule } from '../wallet/wallet.module';
import { SettlementsService } from './settlements.service';
import { ShippingController } from './shipping.controller';
import { ShippingService } from './shipping.service';

@Module({
  imports: [OrdersModule, WalletModule],
  controllers: [ShippingController],
  providers: [ShippingService, SettlementsService],
})
export class ShippingModule {}