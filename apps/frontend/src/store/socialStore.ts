import { ref } from 'vue';
import { IPostContainerDTO, IPostDTO, IPostImage, IPostOwner } from 'custom-types';

export enum LIKE_STATUS {
    LIKED = 'liked',
    UNLIKE = 'unliked',
}

export interface MESSAGE_POST_SHARE_BODY {
    post: IPostDTO;
    images: IPostImage[];
    owner: IPostOwner;
    message: string;
}

export const allSocialPosts = ref<IPostContainerDTO[]>([]);
export const isLoadingSocialPosts = ref<boolean>(false);
