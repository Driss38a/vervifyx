import { AuthUser } from '../auth/decorators/current-user.decorator';
import { MessagesQueryDto, OpenConversationDto, SendMessageDto } from './messaging.dto';
import { MessagingService } from './messaging.service';
export declare class MessagingController {
    private messaging;
    constructor(messaging: MessagingService);
    open(user: AuthUser, dto: OpenConversationDto): Promise<any>;
    openStore(user: AuthUser, slug: string): Promise<any>;
    list(user: AuthUser): Promise<any>;
    messages(user: AuthUser, id: string, q: MessagesQueryDto): Promise<{
        items: any;
        nextBefore: any;
    }>;
    send(user: AuthUser, id: string, dto: SendMessageDto): Promise<any>;
    read(user: AuthUser, id: string): Promise<{
        success: boolean;
    }>;
}
