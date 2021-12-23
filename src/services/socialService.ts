import axios from 'axios';
import config from '@/config';
import { uuidv4 } from '@/common';
import {
    allSocialPosts,
    COMMENT_MODEL,
    isLoadingSocialPosts,
    MESSAGE_POST_SHARE_BODY,
    MESSAGE_TYPE,
    SOCIAL_POST,
} from '@/store/socialStore';
import { myYggdrasilAddress, useAuthState } from '@/store/authStore';
import { Message, MessageTypes } from '@/types';
import { sendMessageObject } from '@/store/chatStore';
import { calcExternalResourceLink } from '@/services/urlService';
import { destroyNotification } from '@/store/notificiationStore';

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

export const likePost = async (postId: string, location: string, commentId: string) => {
    const myAddress = await myYggdrasilAddress();
    return (
        await axios.put<any>(`${endpoint}/like/${postId}`, {
            liker_location: myAddress,
            liker_id: user.id,
            owner: location,
        })
    ).data;
};

export const likeComment = async (postId: string, location: string) => {
    const myAddress = await myYggdrasilAddress();
    return (
        await axios.put<any>(`${endpoint}/like/${postId}`, {
            liker_location: myAddress,
            liker_id: user.id,
            owner: location,
        })
    ).data;
};

export const getSinglePost = async (postId: string, location: string) => {
    const response = (
        await axios.get<any>(`${endpoint}/single/post`, {
            params: {
                postId: postId,
                location: location,
            },
        })
    ).data;
    allSocialPosts.value = allSocialPosts.value.map(item => (item.post.id === postId ? response : { ...item }));
    return response;
};

export const setSomeoneIsTyping = async (postId, location) => {
    await axios.put(`${endpoint}/typing`, {
        postId: postId,
        location: location,
    });
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

export const updateSomeoneIsTyping = (chatId: string) => {
    const id = uuidv4();
    allSocialPosts.value = allSocialPosts.value.map((item, idx) => {
        if (item.post.id === chatId) {
            return {
                ...item,
                isTyping: [allSocialPosts.value[idx].isTyping, id].flat(Infinity),
            };
        }
        return {
            ...item,
        };
    });
    setTimeout(() => destroySomeoneIsTyping(chatId, id), 2500);
};

export const destroySomeoneIsTyping = (chatId, queueId) => {
    allSocialPosts.value = allSocialPosts?.value?.map((item, idx) => {
        if (item.post.id === chatId) {
            const filteredArray = item?.isTyping
                .filter(item => item !== queueId)
                .filter(function (x) {
                    return x !== undefined;
                });
            return {
                ...item,
                isTyping: filteredArray,
            };
        }
        return {
            ...item,
        };
    });
};

export const createMessage = async (chatId, post: SOCIAL_POST): Promise<Message<MESSAGE_POST_SHARE_BODY>> => {
    const { user } = useAuthState();
    return {
        id: uuidv4(),
        from: user.id,
        to: <string>chatId,
        body: {
            message: 'A post has been shared',
            post: post.post,
            images: post.images,
            owner: post.owner,
        },
        timeStamp: new Date(),
        type: MessageTypes.POST_SHARE,
        replies: [],
        subject: null,
    };
};

export const sendMessageSharePost = async (chatId: string, post: SOCIAL_POST) => {
    const newMessage: Message<MESSAGE_POST_SHARE_BODY> = await createMessage(chatId, post);
    sendMessageObject(chatId, newMessage);
};
