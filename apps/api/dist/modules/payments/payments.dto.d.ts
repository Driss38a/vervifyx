export declare class TopUpDto {
    amountMinor: number;
}
export declare class PayoutRequestDto {
    amountMinor: number;
    method: string;
    destination: string;
}
export declare class PayoutPaidDto {
    reference: string;
}
export declare class PayoutRejectDto {
    note?: string;
}
