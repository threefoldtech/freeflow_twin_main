// FILE ACTIONS
export const FileAction = {
    ADD_TO_CHAT: 'ADD_TO_CHAT',
    CHANGE_AVATAR: 'CHANGE_AVATAR',
    ADD_TO_POST: 'ADD_TO_POST',
};
export type FileAction = typeof FileAction[keyof typeof FileAction];

const FileType = {
    RECORDING: 'RECORDING',
    OTHER: 'OTHER',
};
export type FileType = typeof FileType[keyof typeof FileType];

export interface ChatFile {
    messageId: string;
    chatId: string;
    type: FileType;
    filename: string;
}

export interface PostFile {
    postId: string;
    filename: string;
}

// POSTS
export const PostType = {
    SOCIAL_POST: 'SOCIAL_POST',
};
export type PostType = typeof PostType[keyof typeof PostType];

export interface IPostOwner {
    id: string;
    location: string;
}

export interface IPostLike extends IPostOwner {}
export interface ICommentOwner extends IPostOwner {}

export const CommentType = {
    COMMENT: 'COMMENT',
    COMMENT_REPLY: 'COMMENT_REPLY',
};
export type CommentType = typeof CommentType[keyof typeof CommentType];

export interface IPostImage {
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

export interface IPostComment {
    body: string;
    createdOn: Date;
    id: string;
    isReplyToComment: boolean;
    likes: IPostLike[];
    owner: ICommentOwner;
    post: { id: string; owner: IPostOwner };
    replies: IPostComment[];
    replyTo?: string;
    type: CommentType;
}

export class IPostDTO {
    id: string;
    body: string;
    createdOn: Date;
    isGroupPost: boolean;
    lastModified: Date;
    type: PostType;
    images: string[];
}

export interface IPostContainerDTO {
    post: IPostDTO;
    owner: IPostOwner;
    likes: IPostLike[];
    images: string[];
    replies: IPostComment[];
    isTyping?: String[];
}

// STATUS
import * as redis from 'redis-om';
export interface Status extends redis.EntityData {
    avatar: string;
    isOnline: boolean;
}

export interface StatusUpdate extends redis.EntityData {
    id: string;
    isOnline: boolean;
}
