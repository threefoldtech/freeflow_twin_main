import { ref } from 'vue';

export enum POST_TYPE {
    SOCIAL_POST = 'SOCIAL_POST',
}

export enum LIKE_STATUS {
    LIKED = 'liked',
    UNLIKE = 'unliked',
}

interface POST_MODEL {
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
    likes: any[];
    images: POST_IMAGE[];
}

export const allSocialPosts = ref<SOCIAL_POST[]>([]);
export const isLoadingSocialPosts = ref<boolean>(false);
