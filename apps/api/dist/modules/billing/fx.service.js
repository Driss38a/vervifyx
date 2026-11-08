"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FxService = exports.minorExponent = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const ZERO_DECIMAL = new Set(['JPY', 'KRW', 'VND', 'CLP', 'ISK', 'UGX', 'XAF', 'XOF', 'PYG', 'RWF', 'VUV', 'KMF', 'DJF', 'GNF']);
const THREE_DECIMAL = new Set(['KWD', 'BHD', 'OMR', 'JOD', 'TND', 'LYD', 'IQD']);
const minorExponent = (c) => (ZERO_DECIMAL.has(c) ? 0 : THREE_DECIMAL.has(c) ? 3 : 2);
exports.minorExponent = minorExponent;
let FxService = class FxService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async rate(base, quote) {
        if (base === quote)
            return 1;
        const direct = await this.prisma.fxRate.findUnique({ where: { base_quote: { base, quote } } });
        if (direct)
            return direct.rate;
        const inverse = await this.prisma.fxRate.findUnique({ where: { base_quote: { base: quote, quote: base } } });
        if (inverse)
            return 1 / inverse.rate;
        throw new common_1.BadRequestException(`No exchange rate available for ${base}/${quote}`);
    }
    async convert(amountMinor, from, to) {
        if (from === to)
            return amountMinor;
        const r = await this.rate(from, to);
        const major = amountMinor / 10 ** (0, exports.minorExponent)(from);
        return Math.round(major * r * 10 ** (0, exports.minorExponent)(to));
    }
    setRate(base, quote, rate) {
        return this.prisma.fxRate.upsert({
            where: { base_quote: { base, quote } }, create: { base, quote, rate }, update: { rate },
        });
    }
};
exports.FxService = FxService;
exports.FxService = FxService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
], FxService);
//# sourceMappingURL=fx.service.js.map