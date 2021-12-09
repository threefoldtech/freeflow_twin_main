import { ref } from 'vue';

export enum POST_TYPE {
    SOCIAL_POST = 'SOCIAL_POST',
}

export enum LIKE_STATUS {
    LIKED = 'liked',
    UNLIKE = 'unliked',
}

export enum MESSAGE_TYPE {
    COMMENT = 'COMMENT',
    COMMENT_REPLY = 'COMMENT_REPLY',
}

export interface POST_MODEL {
    id: string;
    type: POST_TYPE;
    body: string;
    isGroupPost: boolean;
    createdOn: Date;
    lastModified: Date;
}

interface POST_OWNER {
    id: string;
    location: string;
}

interface LIKE_MODEL extends POST_OWNER {}
interface COMMENT_OWNER extends POST_OWNER {}

export interface COMMENT_MODEL {
    id: string;
    body: string;
    owner: COMMENT_OWNER;
    post: {
        id: string;
        owner: POST_OWNER;
    };
    type: MESSAGE_TYPE;
    replies: COMMENT_MODEL[];
    createdOn: Date;
    likes: LIKE_MODEL[];
    replyTo?: string | undefined;
    isReplyToComment: boolean;
}

interface POST_IMAGE {
    name: string;
    data: object;
    size: number;
    encoding: string;
    tempFilePath: string;
    truncated: boolean;
    mimetype: string;
    md5: string;
    path: string;
}

export interface SOCIAL_POST {
    post: POST_MODEL;
    owner: POST_OWNER;
    likes: LIKE_MODEL[];
    images: POST_IMAGE[];
}

export const allSocialPosts = ref<SOCIAL_POST[]>([]);
export const isLoadingSocialPosts = ref<boolean>(false);
