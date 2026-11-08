import { Body, Controller, Get, HttpCode, Param, Post, Query, UseGuards } from '@nestjs/common';
import { OrderStatus, Role } from '@prisma/client';
import { AuthUser, CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateOrderDto } from './orders.dto';
import { OrdersService } from './orders.service';

@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private orders: OrdersService) {}

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateOrderDto) { return this.orders.create(user.id, dto); }

  @Get('mine')
  mine(@CurrentUser() user: AuthUser, @Query('page') page?: string) {
    return this.orders.mine(user.id, page ? Math.max(1, Number(page) || 1) : 1);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.SELLER, Role.CREATOR)
  @Get('store/:storeId')
  forStore(@CurrentUser() user: AuthUser, @Param('storeId') storeId: string, @Query('status') status?: OrderStatus) {
    return this.orders.forStore(user.id, storeId, status && status in OrderStatus ? status : undefined);
  }

  @Get(':id')
  get(@CurrentUser() user: AuthUser, @Param('id') id: string) { return this.orders.getOne(user.id, user.role, id); }

  @UseGuards(RolesGuard)
  @Roles(Role.SELLER, Role.CREATOR)
  @HttpCode(200)
  @Post(':id/confirm')
  confirm(@CurrentUser() user: AuthUser, @Param('id') id: string) { return this.orders.confirm(user.id, id); }

  @HttpCode(200)
  @Post(':id/cancel')
  cancel(@CurrentUser() user: AuthUser, @Param('id') id: string) { return this.orders.cancel(user.id, id); }

  @UseGuards(RolesGuard)
  @Roles(Role.SELLER, Role.CREATOR)
  @HttpCode(200)
  @Post(':id/complete')
  complete(@CurrentUser() user: AuthUser, @Param('id') id: string) { return this.orders.complete(user.id, id); }
}