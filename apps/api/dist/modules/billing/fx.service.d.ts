import { PrismaService } from '../../prisma/prisma.service';
export declare const minorExponent: (c: string) => 2 | 0 | 3;
export declare class FxService {
    private prisma;
    constructor(prisma: PrismaService);
    rate(base: string, quote: string): Promise<number>;
    convert(amountMinor: number, from: string, to: string): Promise<number>;
    setRate(base: string, quote: string, rate: number): any;
}
