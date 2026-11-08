import { IsInt, IsOptional, IsString, Length, Matches, Max, Min } from 'class-validator';
import { PaginationDto } from '../../common/pagination.dto';

export class CreateStoreDto {
  @IsString() @Length(2, 80) name: string;
  @IsOptional() @IsString() @Matches(/^[a-z0-9-]{3,40}$/) slug?: string;
  @IsOptional() @IsString() @Length(0, 1000) description?: string;
  @IsOptional() @IsString() @Length(2, 40) templateKey?: string;
  @IsOptional() @IsString() @Length(3, 3) currency?: string;
  @IsOptional() @IsString() @Length(2, 2) country?: string;
}

export class UpdateStoreDto {
  @IsOptional() @IsString() @Length(2, 80) name?: string;
  @IsOptional() @IsString() @Length(0, 1000) description?: string;
  @IsOptional() @IsString() @Length(0, 500) logoUrl?: string;
  @IsOptional() @IsInt() @Min(0) @Max(100_000_000) shippingFlatMinor?: number;
  @IsOptional() @IsInt() @Min(0) @Max(100_000_000) freeShippingOverMinor?: number;
}

export class StoreQueryDto extends PaginationDto {
  @IsOptional() @IsString() @Length(1, 80) q?: string;
}