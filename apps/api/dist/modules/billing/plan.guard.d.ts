import { CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { PlanAudience } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
export declare const PLAN_KEY = "requires_plan";
export interface PlanMeta {
    audience: PlanAudience;
    productLimit?: boolean;
}
export declare const RequiresPlan: (audience: "SELLER" | "CARRIER", opts?: {
    productLimit?: boolean;
}) => import("@nestjs/common").CustomDecorator<string>;
export declare class SubscriptionGuard implements CanActivate {
    private reflector;
    private config;
    private prisma;
    constructor(reflector: Reflector, config: ConfigService, prisma: PrismaService);
    canActivate(ctx: ExecutionContext): Promise<boolean>;
}
