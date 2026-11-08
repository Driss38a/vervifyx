import { Body, Controller, Get, HttpCode, Param, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AuthUser, CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AssignDto, CarrierStatusDto, RegisterCarrierDto, SetZonesDto, ShipmentEventDto } from './shipping.dto';
import { SettlementsService } from './settlements.service';
import { ShippingService } from './shipping.service';

@Controller()
export class ShippingController {
  constructor(private shipping: ShippingService, private settlements: SettlementsService) {}

  @Get('carriers')
  list(@Query('country') country?: string) { return this.shipping.listPublic(country); }

  @Get('shipping/ranking-policy')
  policy() { return this.shipping.rankingPolicy(); }

  @Get('tracking/:code')
  track(@Param('code') code: string) { return this.shipping.track(code); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CARRIER)
  @Post('carriers')
  register(@CurrentUser() user: AuthUser, @Body() dto: RegisterCarrierDto) { return this.shipping.register(user.id, dto); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CARRIER)
  @Get('carriers/me')
  me(@CurrentUser() user: AuthUser) { return this.shipping.myCarrier(user.id); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CARRIER)
  @Put('carriers/me/zones')
  zones(@CurrentUser() user: AuthUser, @Body() dto: SetZonesDto) { return this.shipping.setZones(user.id, dto); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CARRIER)
  @Get('shipping/carrier/shipments')
  myShipments(@CurrentUser() user: AuthUser) { return this.shipping.carrierShipments(user.id); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CARRIER)
  @HttpCode(200)
  @Post('shipping/shipments/:id/events')
  event(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: ShipmentEventDto) {
    return this.shipping.addEvent(user.id, id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.CREATOR)
  @Get('shipping/orders/:orderId/rates')
  rates(@CurrentUser() user: AuthUser, @Param('orderId') orderId: string) { return this.shipping.ratesForOrder(user.id, orderId); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.CREATOR)
  @Post('shipping/orders/:orderId/assign')
  assign(@CurrentUser() user: AuthUser, @Param('orderId') orderId: string, @Body() dto: AssignDto) {
    return this.shipping.assign(user.id, orderId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('settlements/mine')
  mySettlements(@CurrentUser() user: AuthUser) { return this.settlements.mine(user.id, user.role); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('settlements/admin/pending')
  pending() { return this.settlements.pending(); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(200)
  @Post('settlements/admin/:id/remit')
  remit(@Param('id') id: string) { return this.settlements.remit(id); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch('carriers/:id/status')
  status(@Param('id') id: string, @Body() dto: CarrierStatusDto) { return this.shipping.setStatus(id, dto.status); }
}