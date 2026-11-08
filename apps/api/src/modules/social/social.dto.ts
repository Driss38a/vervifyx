import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsIn, IsInt, IsOptional, IsString, IsUUID, IsUrl, Length, Max, Min } from 'class-validator';

export class CreatePostDto {
  @IsOptional() @IsString() @Length(1, 5000) body?: string;

  @IsOptional() @IsArray() @ArrayMaxSize(10)
  @IsUrl({ protocols: ['https'], require_protocol: true }, { each: true })
  mediaUrls?: string[];

  @IsOptional() @IsUUID() productId?: string;
}

export class CommentDto {
  @IsString() @Length(1, 2000) body: string;
}

export class CursorQueryDto {
  @IsOptional() @IsUUID() cursor?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(50) limit?: number;
}

export class FeedQueryDto extends CursorQueryDto {
  @IsOptional() @IsIn(['following', 'discover']) mode?: 'following' | 'discover';
}

export class ModeratePostDto {
  @IsIn(['APPROVE', 'REMOVE']) action: 'APPROVE' | 'REMOVE';
}