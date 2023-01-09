import { ref } from 'vue';
import { IPostContainerDTO, IPostDTO, IPostOwner } from 'custom-types/post.type';

export enum LIKE_STATUS {
    LIKED = 'liked',
    UNLIKE = 'unliked',
}

export interface MESSAGE_POST_SHARE_BODY {
    post: IPostDTO;
    images: string[];
    owner: IPostOwner;
    message: string;
}

export const allSocialPosts = ref<IPostContainerDTO[]>([]);
export const isLoadingSocialPosts = ref(false);
