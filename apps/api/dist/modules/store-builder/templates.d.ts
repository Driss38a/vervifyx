export declare const SECTION_TYPES: readonly ["hero", "products-grid", "features", "testimonials", "faq", "countdown", "order-form", "rich-text", "video", "image-gallery"];
export type SectionType = (typeof SECTION_TYPES)[number];
export interface Section {
    type: SectionType;
    props: Record<string, unknown>;
}
export interface Theme {
    primary: string;
    background: string;
    text: string;
    font: string;
    radius: number;
}
export interface TemplateDef {
    key: string;
    name: string;
    description: string;
    theme: Theme;
    homeSections: Section[];
}
export declare const TEMPLATES: Record<string, TemplateDef>;
