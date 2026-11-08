import { ShipmentStatus } from '@prisma/client';
export declare class RegisterCarrierDto {
    companyName: string;
}
export declare class ZoneDto {
    country: string;
    region?: string;
    priceMinor: number;
    currency: string;
    etaDays: number;
}
export declare class SetZonesDto {
    zones: ZoneDto[];
}
export declare class CarrierStatusDto {
    status: 'ACTIVE' | 'SUSPENDED';
}
export declare class AssignDto {
    mode?: 'AUTO' | 'MANUAL';
    carrierId?: string;
}
export declare class ShipmentEventDto {
    status: ShipmentStatus;
    note?: string;
}
