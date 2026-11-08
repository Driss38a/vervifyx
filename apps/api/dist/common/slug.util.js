"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.slugify = slugify;
exports.uniqueSlug = uniqueSlug;
const crypto_1 = require("crypto");
function slugify(input) {
    const s = input
        .normalize('NFKC')
        .toLowerCase()
        .replace(/[^\p{L}\p{M}\p{N}]+/gu, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 60);
    return s || 'item';
}
function uniqueSlug(input) {
    return `${slugify(input)}-${(0, crypto_1.randomBytes)(3).toString('hex')}`;
}
//# sourceMappingURL=slug.util.js.map