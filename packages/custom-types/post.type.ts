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

export interface IPostDTO {
    id: string;
    body: string;
    createdOn: Date;
    isGroupPost: boolean;
    lastModified: Date;
    type: PostType;
    replies: IPostComment[];
    signatures: string;
    images?: string[];
    video?: string;
}

export interface IPostContainerDTO {
    id: string;
    post: IPostDTO;
    owner: IPostOwner;
    ownerId: string;
    likes: IPostLike[];
    images: string[];
    video: string;
    replies: IPostComment[];
    isTyping?: String[];
}
