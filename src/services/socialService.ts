import axios from 'axios';
import { PathInfo } from '@/services/fileBrowserService';
import config from '@/config';
import { uuidv4 } from '@/common';
import { ref } from 'vue';
import { allSocialPosts, isLoadingSocialPosts } from '@/store/socialStore';
import { calcExternalResourceLink } from '@/services/urlService';
import { myYggdrasilAddress, useAuthState } from '@/store/authStore';

const endpoint = `${config.baseUrl}api/posts`;

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

export const sortPosts = posts => {
    if (!posts) {
        allSocialPosts.value.sort(function (a, b) {
            return new Date(b.post.createdOn) - new Date(a.post.createdOn);
        });
        return;
    }
    return posts.sort(function (a, b) {
        return new Date(b.post.createdOn) - new Date(a.post.createdOn);
    });
};

export const getAllPosts = async () => {
    isLoadingSocialPosts.value = true;
    const posts = (await axios.get<any>(`${endpoint}/true`)).data;
    isLoadingSocialPosts.value = false;
    allSocialPosts.value = sortPosts(posts);
};

export const likePost = async (postId: string, location: string) => {
    console.log(postId, location);
    //const test = calcExternalResourceLink(`https://[${location}]/api/posts/like/${postId}`);
    const myAddress = await myYggdrasilAddress();
    const { user } = useAuthState();
    console.log(myAddress);

    return (
        await axios.put<any>(`${endpoint}/like/${postId}`, {
            liker_location: myAddress,
            liker_id: user.id,
            owner: location,
        })
    ).data;

    //const posts = (await axios.get<any>(`${endpoint}/like/${postId}`)).data;

    //console.log(posts);
    //calcExternalResourceLink()
};
