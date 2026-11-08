import { PrismaService } from '../../prisma/prisma.service';
import { ChatGateway } from './chat.gateway';
import { MessagesQueryDto } from './messaging.dto';
export declare class MessagingService {
    private prisma;
    private gateway;
    constructor(prisma: PrismaService, gateway: ChatGateway);
    open(userId: string, otherId: string): Promise<any>;
    openWithStore(userId: string, storeSlug: string): Promise<any>;
    list(userId: string): Promise<any>;
    messages(userId: string, conversationId: string, q: MessagesQueryDto): Promise<{
        items: any;
        nextBefore: any;
    }>;
    send(userId: string, conversationId: string, body: string): Promise<any>;
    markRead(userId: string, conversationId: string): Promise<{
        success: boolean;
    }>;
    private assertMember;
}
