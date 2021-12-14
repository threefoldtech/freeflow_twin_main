import axios from 'axios';
import config from '@/config';
import { uuidv4 } from '@/common';
import { allSocialPosts, COMMENT_MODEL, isLoadingSocialPosts, MESSAGE_TYPE, SOCIAL_POST } from '@/store/socialStore';
import { myYggdrasilAddress, useAuthState } from '@/store/authStore';

const endpoint = `${config.baseUrl}api/posts`;

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
    const myAddress = await myYggdrasilAddress();
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
    isReplyToComment: boolean,
    comment_id?: string
) => {
    const myAddress = await myYggdrasilAddress();
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
        type: isReplyToComment ? MESSAGE_TYPE.COMMENT_REPLY : MESSAGE_TYPE.COMMENT,
        replies: [],
        createdOn: new Date(),
        likes: [],
        replyTo: isReplyToComment ? comment_id : '',
        isReplyToComment: isReplyToComment,
    };
    return (await axios.put<any>(`${endpoint}/comment/${item.post.id}`, data)).data;
};
