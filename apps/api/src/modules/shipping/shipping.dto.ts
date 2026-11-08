import { Type } from 'class-transformer';
import {
  ArrayMaxSize, IsArray, IsEnum, IsIn, IsInt, IsOptional, IsString, IsUUID, Length, Max, Min, ValidateNested,
} from 'class-validator';
import { ShipmentStatus } from '@prisma/client';

export class RegisterCarrierDto {
  @IsString() @Length(2, 120) companyName: string;
}

export class ZoneDto {
  @IsString() @Length(2, 2) country: string;
  @IsOptional() @IsString() @Length(1, 80) region?: string;
  @IsInt() @Min(0) @Max(100_000_000) priceMinor: number;
  @IsString() @Length(3, 3) currency: string;
  @IsInt() @Min(1) @Max(60) etaDays: number;
}

export class SetZonesDto {
  @IsArray() @ArrayMaxSize(500) @ValidateNested({ each: true }) @Type(() => ZoneDto)
  zones: ZoneDto[];
}

export class CarrierStatusDto {
  @IsIn(['ACTIVE', 'SUSPENDED']) status: 'ACTIVE' | 'SUSPENDED';
}

export class AssignDto {
  @IsOptional() @IsIn(['AUTO', 'MANUAL']) mode?: 'AUTO' | 'MANUAL';
  @IsOptional() @IsUUID() carrierId?: string;
}

export class ShipmentEventDto {
  @IsEnum(ShipmentStatus) status: ShipmentStatus;
  @IsOptional() @IsString() @Length(0, 300) note?: string;
}