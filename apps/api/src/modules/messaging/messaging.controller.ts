import { Body, Controller, Get, HttpCode, Param, Post, Query, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthUser, CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MessagesQueryDto, OpenConversationDto, SendMessageDto } from './messaging.dto';
import { MessagingService } from './messaging.service';

@UseGuards(JwtAuthGuard)
@Controller('messages')
export class MessagingController {
  constructor(private messaging: MessagingService) {}

  @HttpCode(200)
  @Post('conversations')
  open(@CurrentUser() user: AuthUser, @Body() dto: OpenConversationDto) { return this.messaging.open(user.id, dto.userId); }

  @HttpCode(200)
  @Post('conversations/store/:slug')
  openStore(@CurrentUser() user: AuthUser, @Param('slug') slug: string) { return this.messaging.openWithStore(user.id, slug); }

  @Get('conversations')
  list(@CurrentUser() user: AuthUser) { return this.messaging.list(user.id); }

  @Get('conversations/:id/messages')
  messages(@CurrentUser() user: AuthUser, @Param('id') id: string, @Query() q: MessagesQueryDto) {
    return this.messaging.messages(user.id, id, q);
  }

  @Throttle({ default: { ttl: 60_000, limit: 40 } })
  @Post('conversations/:id/messages')
  send(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: SendMessageDto) {
    return this.messaging.send(user.id, id, dto.body);
  }

  @HttpCode(200)
  @Post('conversations/:id/read')
  read(@CurrentUser() user: AuthUser, @Param('id') id: string) { return this.messaging.markRead(user.id, id); }
}