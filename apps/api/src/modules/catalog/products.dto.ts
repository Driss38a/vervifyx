import { Type } from 'class-transformer';
import {
  ArrayMaxSize, IsArray, IsEnum, IsIn, IsInt, IsOptional, IsString, Length, Max, Min, ValidateNested,
} from 'class-validator';
import { ProductType } from '@prisma/client';
import { PaginationDto } from '../../common/pagination.dto';

export class VariantDto {
  @IsString() @Length(1, 80) name: string;
  @IsOptional() @IsInt() @Min(0) priceMinor?: number;
  @IsOptional() @IsInt() @Min(0) stock?: number;
}

export class CreateProductDto {
  @IsEnum(ProductType) type: ProductType;
  @IsString() @Length(3, 160) title: string;
  @IsString() @Length(10, 10000) description: string;
  @IsInt() @Min(0) @Max(100_000_000) priceMinor: number;
  @IsOptional() @IsString() @Length(3, 3) currency?: string;
  @IsOptional() @IsInt() @Min(0) stock?: number;
  @IsOptional() @IsString() categorySlug?: string;
  @IsOptional() @IsArray() @ArrayMaxSize(50) @ValidateNested({ each: true }) @Type(() => VariantDto)
  variants?: VariantDto[];
}

export class UpdateProductDto {
  @IsOptional() @IsString() @Length(3, 160) title?: string;
  @IsOptional() @IsString() @Length(10, 10000) description?: string;
  @IsOptional() @IsInt() @Min(0) @Max(100_000_000) priceMinor?: number;
  @IsOptional() @IsInt() @Min(0) stock?: number;
  @IsOptional() @IsString() categorySlug?: string;
  @IsOptional() @IsArray() @ArrayMaxSize(50) @ValidateNested({ each: true }) @Type(() => VariantDto)
  variants?: VariantDto[];
}

export class ProductQueryDto extends PaginationDto {
  @IsOptional() @IsString() @Length(1, 80) q?: string;
  @IsOptional() @IsEnum(ProductType) type?: ProductType;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsString() store?: string;
}

export class ReviewProductDto {
  @IsIn(['APPROVE', 'REJECT']) action: 'APPROVE' | 'REJECT';
  @IsOptional() @IsString() @Length(0, 500) note?: string;
}