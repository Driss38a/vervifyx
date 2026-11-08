import { Type } from 'class-transformer';
import {
  ArrayMaxSize, ArrayMinSize, IsArray, IsIn, IsInt, IsOptional, IsString, IsUUID, Length, Matches, Max, Min, ValidateNested,
} from 'class-validator';

export class OrderItemDto {
  @IsUUID() productId: string;
  @IsOptional() @IsUUID() variantId?: string;
  @IsInt() @Min(1) @Max(100) quantity: number;
}

export class AddressDto {
  @IsString() @Length(2, 120) fullName: string;
  @IsString() @Matches(/^\+?[0-9 ()-]{6,20}$/) phone: string;
  @IsString() @Length(2, 2) country: string;
  @IsOptional() @IsString() @Length(1, 80) region?: string;
  @IsString() @Length(1, 80) city: string;
  @IsString() @Length(3, 300) address: string;
  @IsOptional() @IsString() @Length(1, 20) postalCode?: string;
}

export class CreateOrderDto {
  @IsArray() @ArrayMinSize(1) @ArrayMaxSize(50) @ValidateNested({ each: true }) @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsOptional() @ValidateNested() @Type(() => AddressDto)
  shippingAddress?: AddressDto;

  @IsIn(['COD', 'WALLET']) paymentMethod: 'COD' | 'WALLET';

  @IsOptional() @IsString() @Length(0, 500) note?: string;
}