import { ref } from 'vue';
import { PostContainerDTO, PostDTO, PostImage, PostOwner } from 'types/post.type';

export enum LIKE_STATUS {
    LIKED = 'liked',
    UNLIKE = 'unliked',
}

export interface MESSAGE_POST_SHARE_BODY {
    post: PostDTO;
    images: PostImage[];
    owner: PostOwner;
    message: string;
}

export const allSocialPosts = ref<PostContainerDTO[]>([]);
export const isLoadingSocialPosts = ref<boolean>(false);
