import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AuthUser, CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ApplyTemplateDto, UpsertLandingDto, UpsertPageDto } from './builder.dto';
import { BuilderService } from './builder.service';

@Controller('builder')
export class BuilderController {
  constructor(private builder: BuilderService) {}

  @Get('templates')
  templates() { return this.builder.listTemplates(); }

  @Get('public/landing/:slug')
  publicLanding(@Param('slug') slug: string) { return this.builder.getPublicLanding(slug); }

  @Get('public/:storeSlug/pages/:slug')
  publicPage(@Param('storeSlug') storeSlug: string, @Param('slug') slug: string) {
    return this.builder.getPublicPage(storeSlug, slug);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.CREATOR)
  @Post('stores/:storeId/apply-template')
  apply(@CurrentUser() user: AuthUser, @Param('storeId') storeId: string, @Body() dto: ApplyTemplateDto) {
    return this.builder.applyTemplate(user.id, storeId, dto.templateKey);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.CREATOR)
  @Put('stores/:storeId/pages/:slug')
  upsertPage(
    @CurrentUser() user: AuthUser, @Param('storeId') storeId: string,
    @Param('slug') slug: string, @Body() dto: UpsertPageDto,
  ) { return this.builder.upsertPage(user.id, storeId, slug, dto); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.CREATOR)
  @Put('products/:productId/landing')
  upsertLanding(@CurrentUser() user: AuthUser, @Param('productId') productId: string, @Body() dto: UpsertLandingDto) {
    return this.builder.upsertLanding(user.id, productId, dto);
  }
}