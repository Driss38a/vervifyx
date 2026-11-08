import { AuthUser } from '../auth/decorators/current-user.decorator';
import { CommentDto, CreatePostDto, CursorQueryDto, FeedQueryDto, ModeratePostDto } from './social.dto';
import { SocialService } from './social.service';
export declare class SocialController {
    private social;
    constructor(social: SocialService);
    profile(username: string): Promise<any>;
    userPosts(username: string, q: CursorQueryDto): Promise<{
        mode?: string;
        items: (Omit<{
            id: string;
            reactions: unknown[];
        }, "reactions"> & {
            likedByMe: boolean;
        })[];
        nextCursor: string;
    }>;
    feed(user: AuthUser, q: FeedQueryDto): Promise<{
        mode?: string;
        items: (Omit<{
            id: string;
            reactions: unknown[];
        }, "reactions"> & {
            likedByMe: boolean;
        })[];
        nextCursor: string;
    }>;
    create(user: AuthUser, dto: CreatePostDto): Promise<any>;
    remove(user: AuthUser, id: string): Promise<{
        success: boolean;
    }>;
    comments(id: string, q: CursorQueryDto): Promise<{
        items: any;
        nextCursor: any;
    }>;
    comment(user: AuthUser, id: string, dto: CommentDto): Promise<any>;
    like(user: AuthUser, id: string): Promise<{
        liked: boolean;
        count: any;
    }>;
    follow(user: AuthUser, username: string): Promise<{
        following: boolean;
    }>;
    unfollow(user: AuthUser, username: string): Promise<{
        following: boolean;
    }>;
    moderate(id: string, dto: ModeratePostDto): Promise<{
        success: boolean;
    }>;
}
