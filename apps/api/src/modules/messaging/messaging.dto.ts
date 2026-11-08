import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, IsUUID, Length, Max, Min } from 'class-validator';

export class OpenConversationDto {
  @IsUUID() userId: string;
}

export class SendMessageDto {
  @IsString() @Length(1, 4000) body: string;
}

export class MessagesQueryDto {
  @IsOptional() @IsUUID() before?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(50) limit?: number;
}