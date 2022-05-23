export enum PostType {
    SOCIAL_POST = 'SOCIAL_POST',
}

export interface PostOwner {
    id: string;
    location: string;
}

interface PostLike extends PostOwner {}
interface CommentOwner extends PostOwner {}

export enum CommentType {
    COMMENT = 'COMMENT',
    COMMENT_REPLY = 'COMMENT_REPLY',
}

export interface PostImage {
    data: { type: string; data: [] };
    encoding: string;
    md5: string;
    mimetype: string;
    name: string;
    path: string;
    size: number;
    tempFilePath: string;
    truncated: boolean;
}

export interface PostComment {
    body: string;
    createdOn: Date;
    id: string;
    isReplyToComment: boolean;
    likes: PostLike[];
    owner: CommentOwner;
    post: { id: string; owner: PostOwner };
    replies: PostComment[];
    replyTo?: string;
    type: CommentType;
}

export interface PostDTO {
    id: string;
    body: string;
    createdOn: Date;
    isGroupPost: boolean;
    lastModified: Date;
    type: PostType;
}

export interface PostContainerDTO {
    post: PostDTO;
    owner: PostOwner;
    likes: PostLike[];
    images: PostImage[];
    replies: PostComment[];
    isTyping?: String[];
}
