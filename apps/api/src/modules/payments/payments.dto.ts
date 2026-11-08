import { IsIn, IsInt, IsOptional, IsString, Length, Max, Min } from 'class-validator';

export class TopUpDto {
  @IsInt() @Min(100) @Max(5_000_000) amountMinor: number;
}

export class PayoutRequestDto {
  @IsInt() @Min(1) @Max(100_000_000) amountMinor: number;
  @IsIn(['BANK_TRANSFER', 'PAYPAL', 'MOBILE_MONEY', 'OTHER']) method: string;
  @IsString() @Length(5, 200) destination: string;
}

export class PayoutPaidDto {
  @IsString() @Length(2, 120) reference: string;
}

export class PayoutRejectDto {
  @IsOptional() @IsString() @Length(0, 300) note?: string;
}