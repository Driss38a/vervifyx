export declare class CreatePostDto {
    body?: string;
    mediaUrls?: string[];
    productId?: string;
}
export declare class CommentDto {
    body: string;
}
export declare class CursorQueryDto {
    cursor?: string;
    limit?: number;
}
export declare class FeedQueryDto extends CursorQueryDto {
    mode?: 'following' | 'discover';
}
export declare class ModeratePostDto {
    action: 'APPROVE' | 'REMOVE';
}
