export declare class ApplyTemplateDto {
    templateKey: string;
}
export declare class UpsertPageDto {
    title: string;
    sections: unknown[];
    published?: boolean;
}
export declare class UpsertLandingDto {
    sections?: unknown[];
    theme?: Record<string, unknown>;
    published?: boolean;
}
