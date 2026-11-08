import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

const ZERO_DECIMAL = new Set(['JPY', 'KRW', 'VND', 'CLP', 'ISK', 'UGX', 'XAF', 'XOF', 'PYG', 'RWF', 'VUV', 'KMF', 'DJF', 'GNF']);
const THREE_DECIMAL = new Set(['KWD', 'BHD', 'OMR', 'JOD', 'TND', 'LYD', 'IQD']);
export const minorExponent = (c: string) => (ZERO_DECIMAL.has(c) ? 0 : THREE_DECIMAL.has(c) ? 3 : 2);

@Injectable()
export class FxService {
  constructor(private prisma: PrismaService) {}

  async rate(base: string, quote: string): Promise<number> {
    if (base === quote) return 1;
    const direct = await this.prisma.fxRate.findUnique({ where: { base_quote: { base, quote } } });
    if (direct) return direct.rate;
    const inverse = await this.prisma.fxRate.findUnique({ where: { base_quote: { base: quote, quote: base } } });
    if (inverse) return 1 / inverse.rate;
    throw new BadRequestException(`No exchange rate available for ${base}/${quote}`);
  }

  async convert(amountMinor: number, from: string, to: string): Promise<number> {
    if (from === to) return amountMinor;
    const r = await this.rate(from, to);
    const major = amountMinor / 10 ** minorExponent(from);
    return Math.round(major * r * 10 ** minorExponent(to));
  }

  setRate(base: string, quote: string, rate: number) {
    return this.prisma.fxRate.upsert({
      where: { base_quote: { base, quote } }, create: { base, quote, rate }, update: { rate },
    });
  }
}