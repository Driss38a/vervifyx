import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { OnGatewayConnection } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../../prisma/prisma.service';
export declare class ChatGateway implements OnGatewayConnection {
    private jwt;
    private config;
    private prisma;
    server: Server;
    constructor(jwt: JwtService, config: ConfigService, prisma: PrismaService);
    handleConnection(client: Socket): Promise<void>;
    emitToUser(userId: string, event: string, data: unknown): void;
}
