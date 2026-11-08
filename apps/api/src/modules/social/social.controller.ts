import { Body, Controller, Delete, Get, HttpCode, Param, Post, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AuthUser, CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CommentDto, CreatePostDto, CursorQueryDto, FeedQueryDto, ModeratePostDto } from './social.dto';
import { SocialService } from './social.service';

@Controller()
export class SocialController {
  constructor(private social: SocialService) {}

  @Get('users/:username')
  profile(@Param('username') username: string) { return this.social.profile(username); }

  @Get('users/:username/posts')
  userPosts(@Param('username') username: string, @Query() q: CursorQueryDto) { return this.social.userPosts(username, q); }

  @UseGuards(JwtAuthGuard)
  @Get('feed')
  feed(@CurrentUser() user: AuthUser, @Query() q: FeedQueryDto) { return this.social.feed(user.id, q); }

  @UseGuards(JwtAuthGuard)
  @Post('posts')
  create(@CurrentUser() user: AuthUser, @Body() dto: CreatePostDto) { return this.social.createPost(user.id, dto); }

  @UseGuards(JwtAuthGuard)
  @Delete('posts/:id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) { return this.social.deletePost(user.id, id); }

  @UseGuards(JwtAuthGuard)
  @Get('posts/:id/comments')
  comments(@Param('id') id: string, @Query() q: CursorQueryDto) { return this.social.comments(id, q); }

  @UseGuards(JwtAuthGuard)
  @Post('posts/:id/comments')
  comment(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: CommentDto) {
    return this.social.addComment(user.id, id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @Post('posts/:id/like')
  like(@CurrentUser() user: AuthUser, @Param('id') id: string) { return this.social.toggleLike(user.id, id); }

  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @Post('users/:username/follow')
  follow(@CurrentUser() user: AuthUser, @Param('username') username: string) { return this.social.follow(user.id, username); }

  @UseGuards(JwtAuthGuard)
  @Delete('users/:username/follow')
  unfollow(@CurrentUser() user: AuthUser, @Param('username') username: string) { return this.social.unfollow(user.id, username); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MODERATOR, Role.ADMIN)
  @HttpCode(200)
  @Post('posts/admin/:id/moderate')
  moderate(@Param('id') id: string, @Body() dto: ModeratePostDto) { return this.social.moderatePost(id, dto.action); }
}