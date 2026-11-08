import { Body, Controller, Get, HttpCode, Post, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { IsInt, IsString, IsUUID, Length, Max, Min } from 'class-validator';
import { AuthUser, CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { WalletService } from './wallet.service';

class AdminCreditDto {
  @IsUUID() userId: string;
  @IsInt() @Min(1) @Max(100_000_000) amountMinor: number;
  @IsString() @Length(3, 100) reference: string;
}

@UseGuards(JwtAuthGuard)
@Controller('wallet')
export class WalletController {
  constructor(private wallet: WalletService) {}

  @Get()
  me(@CurrentUser() user: AuthUser) { return this.wallet.get(user.id); }

  @Get('transactions')
  tx(@CurrentUser() user: AuthUser, @Query('page') page?: string) {
    return this.wallet.transactions(user.id, page ? Math.max(1, Number(page) || 1) : 1);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(200)
  @Post('admin/credit')
  async adminCredit(@CurrentUser() admin: AuthUser, @Body() dto: AdminCreditDto) {
    await this.wallet.adminCredit(admin.id, dto.userId, dto.amountMinor, dto.reference);
    return { success: true };
  }
}