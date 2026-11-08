import { Body, Controller, Get, HttpCode, Post, Put, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AuthUser, CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { FxRateDto, SubscribeDto } from './billing.dto';
import { BillingService } from './billing.service';
import { FxService } from './fx.service';

@Controller('billing')
export class BillingController {
  constructor(private billing: BillingService, private fx: FxService) {}

  @Get('plans')
  plans(@Query('audience') audience?: string) { return this.billing.listPlans(audience); }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser() user: AuthUser) { return this.billing.mine(user.id); }

  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @Post('subscribe')
  subscribe(@CurrentUser() user: AuthUser, @Body() dto: SubscribeDto) { return this.billing.subscribe(user.id, dto.planKey); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Put('admin/fx')
  setRate(@Body() dto: FxRateDto) { return this.fx.setRate(dto.base.toUpperCase(), dto.quote.toUpperCase(), dto.rate); }
}