import axios from 'axios';
import config from '@/config';
import { uuidv4 } from '@/common';
import { allSocialPosts, isLoadingSocialPosts, MESSAGE_POST_SHARE_BODY } from '@/store/socialStore';
import { myYggdrasilAddress, useAuthState } from '@/store/authStore';
import { Message, MessageTypes } from '@/types';
import { sendMessageObject } from '@/store/chatStore';
import { CommentType, IPostComment, IPostContainerDTO, IPostDTO, PostType } from 'custom-types/post.type';
import { useSocketActions } from '../store/socketStore';
import { FileAction } from 'custom-types/file-actions.type';

const endpoint = `${config.baseUrl}api/v2/posts`;
const { user } = useAuthState();

interface socialMeta {
    createdOn: Date;
    lastModified: Date;
}

export interface socialPostModel extends socialMeta {
    id: string;
    type: string;
    images?: any[];
    body: string;
    owner?: any[];
    likes?: any[];
    replies: any[];
    isGroupPost: boolean;
    signatures: string;
}

export const createSocialPost = async (text?: string, files: File[] = []) => {
    if (files?.length > 10) return;

    const postId = uuidv4();
    const post: IPostDTO = {
        id: postId,
        type: PostType.SOCIAL_POST,
        body: text,
        isGroupPost: false,
        createdOn: new Date(),
        lastModified: new Date(),
        replies: [],
        signatures: '',
    };

    files?.map(async file => {
        const formData = new FormData();
        formData.append(`images`, file);
        // Upload file to tmp
        const { data } = await axios.post(`${config.baseUrl}api/v2/files/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        if (!data.id) return false;
        post.images ? post.images.push(data.id) : (post.images = [data.id]);
        const { sendHandleUploadedFile } = useSocketActions();
        sendHandleUploadedFile({
            fileId: String(data.id),
            payload: { postId, filename: data.filename },
            action: FileAction.ADD_TO_POST,
        });
    });

    return await axios.post<IPostContainerDTO>(`${endpoint}`, post, {
        headers: {
            'Content-Type': 'application/json',
        },
    });
};

export const sortPosts = (posts: IPostContainerDTO[]) => {
    if (!posts) {
        allSocialPosts.value.sort(function (a, b) {
            return new Date(b.post.createdOn).getTime() - new Date(a.post.createdOn).getTime();
        });
        return;
    }
    return posts.sort(function (a, b) {
        return new Date(b.post.createdOn).valueOf() - new Date(a.post.createdOn).valueOf();
    });
};

export const getAllPosts = async () => {
    isLoadingSocialPosts.value = true;
    const posts = (await axios.get<any>(`${endpoint}/${user.id}`)).data;
    isLoadingSocialPosts.value = false;
    allSocialPosts.value = sortPosts(posts);
};

export const likePost = async (postId: string, location: string, _commentId?: string) => {
    const myAddress = await myYggdrasilAddress();
    return (
        await axios.put<any>(`${endpoint}/like/${postId}`, {
            likerLocation: myAddress,
            likerId: user.id,
            owner: location,
        })
    ).data;
};

export const likeComment = async (
    postId: string,
    location: string,
    commentId: string,
    isReplyToComment: boolean,
    replyTo: string
) => {
    return (
        await axios.put(`${endpoint}/comments/like`, {
            likerId: user.id,
            postId,
            owner: location,
            commentId,
            isReplyToComment,
            replyTo,
        })
    ).data;
};

export const getSinglePost = async (postId: string, location: string) => {
    const response = (await axios.get<IPostContainerDTO>(`${endpoint}/${location}/${postId}`)).data;
    allSocialPosts.value = allSocialPosts.value.map(item => (item.post.id === postId ? response : { ...item }));
    return response;
};

export const setSomeoneIsTyping = async (postId: string, location: string, userId: string) => {
    await axios.put(`${endpoint}/typing`, {
        postId: postId,
        location: location,
        userId,
    });
};

export const commentOnPost = async (
    message: string,
    item: IPostContainerDTO,
    isReplyToComment: boolean,
    comment_id?: string
) => {
    const myAddress = await myYggdrasilAddress();
    const data: IPostComment = {
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
        type: isReplyToComment ? CommentType.COMMENT_REPLY : CommentType.COMMENT,
        replies: [],
        createdOn: new Date(),
        likes: [],
        replyTo: isReplyToComment ? comment_id : '',
        isReplyToComment: isReplyToComment,
    };
    return (await axios.put<any>(`${endpoint}/comment/${item.post.id}`, data)).data;
};

export const updateSomeoneIsTyping = (postId: string, userId: string) => {
    if (user.id.toString() === userId) return;
    const id = uuidv4();
    allSocialPosts.value = allSocialPosts?.value.map((item, idx) => {
        if (item.post.id === postId) {
            return {
                ...item,
                isTyping: [allSocialPosts.value[idx].isTyping, id].flat(Infinity),
            };
        }
        return {
            ...item,
        };
    });
    setTimeout(() => destroySomeoneIsTyping(postId, id), 5000);
};

export const destroySomeoneIsTyping = (chatId: string, queueId: string) => {
    allSocialPosts.value = allSocialPosts?.value?.map(item => {
        if (item.post.id === chatId) {
            const filteredArray = item?.isTyping
                ?.filter(item => item !== queueId)
                ?.filter(function (x) {
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

export const createMessage = async (
    chatId: string,
    post: IPostContainerDTO
): Promise<Message<MESSAGE_POST_SHARE_BODY>> => {
    const { user } = useAuthState();
    return {
        chatId: '',
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

export const sendMessageSharePost = async (chatId: string, post: IPostContainerDTO) => {
    const newMessage: Message<MESSAGE_POST_SHARE_BODY> = await createMessage(chatId, post);
    sendMessageObject(chatId, newMessage);
};

export const deletePost = async (item: IPostContainerDTO) => {
    const post = item.post.id;
    return await axios.delete(`${endpoint}/${post}`);
};
