import axios from 'axios';
import config from '@/config';
import { uuidv4 } from '@/common';
import { allSocialPosts, COMMENT_MODEL, isLoadingSocialPosts, MESSAGE_TYPE, SOCIAL_POST } from '@/store/socialStore';
import { myYggdrasilAddress, useAuthState } from '@/store/authStore';

const endpoint = `${config.baseUrl}api/posts`;
const myAddress = await myYggdrasilAddress();
const { user } = useAuthState();

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
    return (
        await axios.put<any>(`${endpoint}/like/${postId}`, {
            liker_location: myAddress,
            liker_id: user.id,
            owner: location,
        })
    ).data;
};

export const commentOnPost = async (
    message: string,
    item: SOCIAL_POST,
    isQuote: boolean = true,
    comment_id: string = '3d38970e-40ac-4811-a938-c8a9c392ddbf'
) => {
    console.log(item);
    const data: COMMENT_MODEL = {
        id: uuidv4(),
        body: message,
        owner: {
            id: String(user.id),
            location: myAddress,
        },
        post: {
            id: item.post.id,
            owner: {
                location: String(item.owner.location),
                id: String(item.owner.id),
            },
        },
        type: isQuote ? MESSAGE_TYPE.COMMENT : MESSAGE_TYPE.COMMENT_REPLY,
        replies: [], //Look at this again for quotes
        createdOn: new Date(),
        likes: [],
        replyTo: isQuote ? comment_id : '',
        isReplyToComment: isQuote,
    };
    return (await axios.put<any>(`${endpoint}/comment/${item.post.id}`, data)).data;
};
