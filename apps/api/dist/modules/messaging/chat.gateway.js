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
exports.ChatGateway = void 0;
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const websockets_1 = require("@nestjs/websockets");
const client_1 = require("@prisma/client");
const socket_io_1 = require("socket.io");
const prisma_service_1 = require("../../prisma/prisma.service");
let ChatGateway = class ChatGateway {
    constructor(jwt, config, prisma) {
        this.jwt = jwt;
        this.config = config;
        this.prisma = prisma;
    }
    async handleConnection(client) {
        try {
            const token = String(client.handshake.auth?.token ?? '');
            const payload = await this.jwt.verifyAsync(token, { secret: this.config.getOrThrow('JWT_ACCESS_SECRET') });
            const user = await this.prisma.user.findUnique({ where: { id: payload.sub }, select: { status: true } });
            if (user?.status !== client_1.UserStatus.ACTIVE)
                throw new Error('inactive');
            await client.join(`user:${payload.sub}`);
        }
        catch {
            client.disconnect(true);
        }
    }
    emitToUser(userId, event, data) {
        this.server?.to(`user:${userId}`).emit(event, data);
    }
};
exports.ChatGateway = ChatGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "server", void 0);
exports.ChatGateway = ChatGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({ namespace: '/chat', cors: { origin: true } }),
    __metadata("design:paramtypes", [jwt_1.JwtService, config_1.ConfigService, typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
], ChatGateway);
//# sourceMappingURL=chat.gateway.js.map