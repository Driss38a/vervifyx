import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AuthUser, CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RequiresPlan, SubscriptionGuard } from '../billing/plan.guard';
import { CreateProductDto, ProductQueryDto, ReviewProductDto, UpdateProductDto } from './products.dto';
import { ProductsService } from './products.service';

@Controller()
export class ProductsController {
  constructor(private products: ProductsService) {}

  @Get('products')
  list(@Query() q: ProductQueryDto) { return this.products.listPublic(q); }

  @UseGuards(JwtAuthGuard)
  @Get('products/mine')
  mine(@CurrentUser() user: AuthUser, @Query('storeId') storeId?: string) { return this.products.mine(user.id, storeId); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MODERATOR, Role.ADMIN)
  @Get('products/admin/pending')
  pending(@Query('page') page?: string) { return this.products.pending(page ? Math.max(1, Number(page) || 1) : 1); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MODERATOR, Role.ADMIN)
  @Post('products/admin/:id/review')
  review(@Param('id') id: string, @Body() dto: ReviewProductDto) { return this.products.review(id, dto.action, dto.note); }

  @Get('products/:id')
  get(@Param('id') id: string) { return this.products.getPublic(id); }

  @UseGuards(JwtAuthGuard, RolesGuard, SubscriptionGuard)
  @Roles(Role.SELLER, Role.CREATOR)
  @RequiresPlan('SELLER', { productLimit: true })
  @Post('stores/:storeId/products')
  create(@CurrentUser() user: AuthUser, @Param('storeId') storeId: string, @Body() dto: CreateProductDto) {
    return this.products.create(user.id, storeId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.CREATOR)
  @Patch('products/:id')
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.products.update(user.id, id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.CREATOR)
  @Delete('products/:id')
  archive(@CurrentUser() user: AuthUser, @Param('id') id: string) { return this.products.archive(user.id, id); }
}