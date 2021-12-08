import axios from 'axios';
import { PathInfo } from '@/services/fileBrowserService';
import config from '@/config';
import { uuidv4 } from '@/common';
import { ref } from 'vue';

const endpoint = `${config.baseUrl}api/posts`;

export const allSocialPosts = ref<any[]>([]);
export const isLoadingSocialPosts = ref<boolean>(false);

interface socialMeta {
    createdOn: Date;
    lastModified: Date;
}

export interface socialPostModel extends socialMeta {
    id: string;
    type: string;
    images?: pathToImage[];
    body: string;
    owner?: any[];
    likes?: any[];
    replies: any[];
    isGroupPost: boolean;
    signatures: string;
}

type createPostModel = Omit<socialPostModel, 'images', 'owner', 'likes', 'replies'>;

export const createSocialPost = async (text?: string, files?: File[] = []) => {
    const formData = new FormData();

    files?.forEach((file, key) => {
        formData.append(`images`, file);
    });

    const post: createPostModel = {
        id: uuidv4(),
        type: 'SOCIAL_POST',
        body: text,
        isGroupPost: false,
        createdOn: new Date(),
        lastModified: new Date(),
    };

    Object.keys(post).forEach(key => formData.append(key, post[key]));

    return await axios.post<any>(`${endpoint}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

export const getAllPosts = async () => {
    isLoadingSocialPosts.value = true;
    const posts = await axios.get<any>(`${endpoint}`);
    isLoadingSocialPosts.value = false;
    allSocialPosts.value = posts;
};
