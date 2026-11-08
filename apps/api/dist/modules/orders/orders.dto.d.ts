export declare class OrderItemDto {
    productId: string;
    variantId?: string;
    quantity: number;
}
export declare class AddressDto {
    fullName: string;
    phone: string;
    country: string;
    region?: string;
    city: string;
    address: string;
    postalCode?: string;
}
export declare class CreateOrderDto {
    items: OrderItemDto[];
    shippingAddress?: AddressDto;
    paymentMethod: 'COD' | 'WALLET';
    note?: string;
}
