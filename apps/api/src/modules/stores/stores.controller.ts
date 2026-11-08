import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AuthUser, CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RequiresPlan, SubscriptionGuard } from '../billing/plan.guard';
import { CreateStoreDto, StoreQueryDto, UpdateStoreDto } from './stores.dto';
import { StoresService } from './stores.service';

@Controller('stores')
export class StoresController {
  constructor(private stores: StoresService) {}

  @Get()
  list(@Query() q: StoreQueryDto) { return this.stores.listPublic(q); }

  @UseGuards(JwtAuthGuard)
  @Get('mine')
  mine(@CurrentUser() user: AuthUser) { return this.stores.mine(user.id); }

  @Get(':slug')
  get(@Param('slug') slug: string) { return this.stores.getBySlug(slug); }

  @UseGuards(JwtAuthGuard, RolesGuard, SubscriptionGuard)
  @Roles(Role.SELLER, Role.CREATOR)
  @RequiresPlan('SELLER')
  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateStoreDto) { return this.stores.create(user.id, dto); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.CREATOR)
  @Patch(':id')
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateStoreDto) {
    return this.stores.update(user.id, id, dto);
  }
}