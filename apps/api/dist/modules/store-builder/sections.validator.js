"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSections = validateSections;
const common_1 = require("@nestjs/common");
const templates_1 = require("./templates");
const MAX_SECTIONS = 40;
const MAX_JSON_CHARS = 100_000;
const MAX_STRING = 5_000;
const DANGEROUS = /<\s*\/?\s*(script|iframe|object|embed|style|link|meta)\b|javascript:|data:text\/html/i;
function collectStrings(value, out = [], depth = 0) {
    if (depth > 8)
        throw new common_1.BadRequestException('Sections are nested too deeply');
    if (typeof value === 'string')
        out.push(value);
    else if (Array.isArray(value))
        value.forEach((v) => collectStrings(v, out, depth + 1));
    else if (value && typeof value === 'object')
        Object.values(value).forEach((v) => collectStrings(v, out, depth + 1));
    return out;
}
function validateSections(sections, moderation) {
    if (!Array.isArray(sections) || sections.length > MAX_SECTIONS) {
        throw new common_1.BadRequestException(`sections must be an array of at most ${MAX_SECTIONS} items`);
    }
    if (JSON.stringify(sections).length > MAX_JSON_CHARS)
        throw new common_1.BadRequestException('Page content is too large');
    for (const s of sections) {
        if (!s || typeof s !== 'object' || !templates_1.SECTION_TYPES.includes(s.type)
            || typeof s.props !== 'object' || s.props === null || Array.isArray(s.props)) {
            throw new common_1.BadRequestException('Each section needs a valid "type" and a "props" object');
        }
    }
    const strings = collectStrings(sections);
    for (const str of strings) {
        if (str.length > MAX_STRING)
            throw new common_1.BadRequestException('A text value is too long');
        if (DANGEROUS.test(str))
            throw new common_1.BadRequestException('Unsafe content is not allowed in pages');
        if (/^http:\/\//i.test(str))
            throw new common_1.BadRequestException('Only https links are allowed');
    }
    const screen = moderation.screenText(...strings);
    if (screen.decision === 'REJECT') {
        throw new common_1.BadRequestException({ message: 'Page content violates the marketplace policy', reasons: screen.reasons });
    }
    return sections;
}
//# sourceMappingURL=sections.validator.js.map