import { IsNumber, IsPositive, IsString, Length } from 'class-validator';

export class SubscribeDto {
  @IsString() @Length(2, 60) planKey: string;
}

export class FxRateDto {
  @IsString() @Length(3, 3) base: string;
  @IsString() @Length(3, 3) quote: string;
  @IsNumber() @IsPositive() rate: number;
}