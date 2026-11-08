import { PrismaService } from '../../prisma/prisma.service';
import { ModerationService } from '../moderation/moderation.service';
import { CommentDto, CreatePostDto, CursorQueryDto, FeedQueryDto } from './social.dto';
export declare class SocialService {
    private prisma;
    private moderation;
    constructor(prisma: PrismaService, moderation: ModerationService);
    createPost(userId: string, dto: CreatePostDto): Promise<any>;
    deletePost(userId: string, id: string): Promise<{
        success: boolean;
    }>;
    moderatePost(id: string, action: 'APPROVE' | 'REMOVE'): Promise<{
        success: boolean;
    }>;
    feed(userId: string, q: FeedQueryDto): Promise<{
        mode?: string;
        items: (Omit<{
            id: string;
            reactions: unknown[];
        }, "reactions"> & {
            likedByMe: boolean;
        })[];
        nextCursor: string;
    }>;
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
    private page;
    addComment(userId: string, postId: string, dto: CommentDto): Promise<any>;
    comments(postId: string, q: CursorQueryDto): Promise<{
        items: any;
        nextCursor: any;
    }>;
    toggleLike(userId: string, postId: string): Promise<{
        liked: boolean;
        count: any;
    }>;
    follow(userId: string, username: string): Promise<{
        following: boolean;
    }>;
    unfollow(userId: string, username: string): Promise<{
        following: boolean;
    }>;
    profile(username: string): Promise<any>;
    private visiblePost;
    private userByUsername;
}
