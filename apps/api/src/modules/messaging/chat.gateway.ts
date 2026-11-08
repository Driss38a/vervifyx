import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { OnGatewayConnection, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { UserStatus } from '@prisma/client';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../../prisma/prisma.service';

@WebSocketGateway({ namespace: '/chat', cors: { origin: true } })
export class ChatGateway implements OnGatewayConnection {
  @WebSocketServer() server: Server;

  constructor(private jwt: JwtService, private config: ConfigService, private prisma: PrismaService) {}

  async handleConnection(client: Socket) {
    try {
      const token = String(client.handshake.auth?.token ?? '');
      const payload = await this.jwt.verifyAsync<{ sub: string }>(token, { secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET') });
      const user = await this.prisma.user.findUnique({ where: { id: payload.sub }, select: { status: true } });
      if (user?.status !== UserStatus.ACTIVE) throw new Error('inactive');
      await client.join(`user:${payload.sub}`);
    } catch {
      client.disconnect(true);
    }
  }

  emitToUser(userId: string, event: string, data: unknown) {
    this.server?.to(`user:${userId}`).emit(event, data);
  }
}