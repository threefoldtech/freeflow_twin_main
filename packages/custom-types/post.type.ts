import { IsBoolean, IsDate, IsNotEmpty, IsString } from 'class-validator';

export enum PostType {
    SOCIAL_POST = 'SOCIAL_POST',
}

export interface PostOwner {
    id: string;
    location: string;
}

export interface PostLike extends PostOwner {}
export interface CommentOwner extends PostOwner {}

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
    images: string[];
}

export interface PostContainerDTO {
    post: PostDTO;
    owner: PostOwner;
    likes: PostLike[];
    images: string[];
    replies: PostComment[];
    isTyping?: String[];
}

export class CreatePostDTO {
    @IsString()
    id: string;

    @IsString()
    body: string;

    @IsDate()
    createdOn: Date;

    @IsDate()
    lastModified: Date;

    @IsBoolean()
    isGroupPost: boolean;

    @IsNotEmpty()
    type: PostType;

    images: string[];
}
