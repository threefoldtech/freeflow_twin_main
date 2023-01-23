import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosRequestConfig, ResponseType } from 'axios';
import axiosRetry from 'axios-retry';
import { IPostComment, IPostContainerDTO } from 'custom-types/post.type';
import { IStatusUpdate } from 'custom-types/status.type';
import { parse } from 'node-html-parser';

import { getURLDescription, getURLTitle } from '../../utils/scraper';
import { ChatDTO } from '../chat/dtos/chat.dto';
import { ContactDTO } from '../contact/dtos/contact.dto';
import { MessageDTO } from '../message/dtos/message.dto';
import { LikePostDTO } from '../post/dtos/request/like-post.dto';
import { TypingDTO } from '../post/dtos/request/typing.dto';
import { FailedRequestRepository } from './repositories/failed-request.repository';
import { LikeCommentDTO } from '../post/dtos/request/like-comment.dto';
import { DeleteCommentDTO } from '../post/dtos/delete-comment.dto';
import { Contact } from '../contact/models/contact.model';
import { PostIdentificationDto, PostNotificationDto } from '../firebase/dtos/firebase.dtos';

@Injectable()
export class ApiService {
    constructor(
        private readonly _configService: ConfigService,
        private readonly _failedRequestRepository: FailedRequestRepository
    ) {}

    /**
     * Registers a digital twin to the central users backend API.
     * @param {Object} obj - Object.
     * @param {string} obj.doubleName - Username paired with .3bot.
     * @param {string} obj.signedAddress - Signed Yggdrasil address.
     */
    async registerDigitalTwin({ doubleName, signedAddress }: { doubleName: string; signedAddress: string }) {
        try {
            return await axios.put(
                `${this._configService.get<string>('appBackend')}/api/users/digitaltwin/${doubleName}`,
                {
                    app_id: this._configService.get<string>('appId'),
                    signed_yggdrasil_ip_address: signedAddress,
                }
            );
        } catch (error) {
            throw new BadRequestException(`unable to register digital twin to external API: ${error}`);
        }
    }

    /**
     * Sends a message to another digital twin.
     * @param {Object} obj - Object.
     * @param {string} obj.location - IPv6 location to send message to.
     * @param {MessageDTO} obj.message - Message to send.
     * @param {ResponseType} obj.responseType - Axios optional response type.
     */
    async sendMessageToApi({ location, message }: { location: string; message: MessageDTO<unknown> }) {
        axiosRetry(axios, {
            retries: 5,
            shouldResetTimeout: true,
            retryDelay: retryCount => {
                return retryCount * 2000; // time interval between retries
            },
            retryCondition: () => true,
        });
        const config: AxiosRequestConfig = {
            method: 'PUT',
            url: `http://[${location}]/api/v2/messages`,
            data: message,
            timeout: 5000,
            headers: {
                'Content-Type': 'application/json',
            },
        };
        try {
            return await axios(config);
        } catch {
            await this._failedRequestRepository.createFailedRequestEntry({
                requestParams: config,
                lastAttempt: new Date(),
                location,
            });
            return;
        }
    }

    /**
     * Sends a message to contacts of a group chat.
     * @param {Object} obj - Object.
     * @param {Contact[]} obj.contacts - Contacts to send message to.
     * @param {MessageDTO} obj.message - Message to send.
     * @param {ResponseType} obj.responseType - Axios optional response type.
     */
    async sendMessageToGroup({ contacts, message }: { contacts: ContactDTO[]; message: MessageDTO<unknown> }) {
        Promise.all(
            contacts.map(async contact => {
                if (contact.id !== this._configService.get<string>('userId'))
                    await this.sendMessageToApi({ location: contact.location, message });
            })
        );
    }

    /**
     * Sends your updated status to the given location.
     * @param {Object} obj - Object.
     * @param {string} obj.location - IPv6 location to send status to.
     * @param {IStatusUpdate} obj.status - Status to send.
     */
    async sendStatusUpdate({
        location,
        status,
        responseType,
    }: {
        location: string;
        status: IStatusUpdate;
        responseType?: ResponseType;
    }) {
        try {
            return await axios.put(`http://[${location}]/api/v2/user/update-status`, status, {
                responseType: responseType || 'json',
            });
        } catch {
            return;
        }
    }

    /**
     * Sends a delete chat request to contacts in a chat.
     * There is a security check so that only the group admin can delete chats.
     * @param {Object} obj - Object.
     * @param {string} obj.location - IPv6 location to send request to.
     * @param {string} obj.chatId - Chat id to delete.
     */
    async sendRemoveChat({ location, chatId }: { location: string; chatId: string }) {
        const destinationUrl = `http://[${location}]/api/v2/chats/${chatId}`;
        try {
            return await axios.delete(destinationUrl);
        } catch (error) {
            return;
        }
    }

    /**
     * Sends a delete share request to contact.
     * @param {Object} obj - Object.
     * @param {string} obj.location - IPv6 location to send request to.
     * @param {string} obj.shareId - Share id to delete.
     */
    async sendRemoveShare({ location, shareId, chatId }: { location: string; shareId: string; chatId: string }) {
        const destinationUrl = `http://[${location}]/api/v2/quantum/share/${shareId}/${chatId}`;
        try {
            return await axios.delete(destinationUrl);
        } catch (error) {
            return;
        }
    }

    /**
     * Sends a group invitation to contacts in chat.
     * @param {Object} obj - Object.
     * @param {string} obj.location - IPv6 location to send invite to.
     * @param {ChatDTO} obj.chat - Chat with contacts to invite.
     * @param {ResponseType} obj.responseType - Axios optional response type.
     */
    async sendGroupInvitation({
        location,
        chat,
        responseType,
    }: {
        location: string;
        chat: ChatDTO;
        responseType?: ResponseType;
    }) {
        try {
            return await axios.post(`http://[${location}]/api/v2/chats/group/invite`, chat, {
                responseType: responseType || 'json',
            });
        } catch {
            return;
        }
    }

    async editFile({
        location,
        path,
        content,
        token,
    }: {
        location: string;
        path: string;
        content: string;
        token: string;
    }) {
        try {
            return await axios.post(
                `http://[${location}]/api/v2/quantum/file/internal?path=${btoa(path)}&token=${token}`,
                {
                    content,
                    location,
                    status: 2,
                }
            );
        } catch {
            return;
        }
    }

    /**
     * Sends a message to another digital twin.
     * @param {string} location - IPv6 location to get public key from.
     * @return {string} - Contacts public key.
     */
    async getContactPublicKey({ location }: { location: string }): Promise<string> {
        try {
            const res = await axios.get<string>(`http://[${location}]/api/v2/user/publickey`);
            return res.data;
        } catch (error) {
            throw new BadRequestException(`unable to get public key from external API: ${error}`);
        }
    }

    /**
     * Gets the admins chat from given location.
     * @param {Object} obj - Object.
     * @param {string} obj.location - IPv6 location to get the chat from.
     * @param {string} obj.chatId - chat ID to fetch from location.
     * @return {ChatDTO} - Found chat.
     */
    async getAdminChat({ location, chatId }: { location: string; chatId: string }): Promise<ChatDTO> {
        try {
            return (await axios.get<ChatDTO>(`http://[${location}]/api/v2/chats/admin/${chatId}`)).data;
        } catch (error) {
            throw new BadRequestException(`unable to get admins chat: ${error}`);
        }
    }

    /**
     * Gets an external post.
     * @param {Object} obj - Object.
     * @param {string} obj.location - IPv6 location to get the post from.
     * @param {string} obj.postId - post Id to fetch from location.
     * @return {IPostContainerDTO} - Found post.
     */
    async getExternalPost({ location, postId }: { location: string; postId: string }): Promise<IPostContainerDTO> {
        const destinationUrl = `http://[${location}]/api/v2/posts/${location}/${postId}`;
        try {
            return (
                await axios.get<IPostContainerDTO>(destinationUrl, {
                    timeout: parseInt(this._configService.get<string>('bigPingTimeoutAxiosRequest')),
                })
            ).data;
        } catch (error) {
            throw new BadRequestException(`unable to get external post: ${error}`);
        }
    }

    /**
     * Gets all external posts.
     * @param {Object} obj - Object.
     * @param {string} obj.location - IPv6 location to get the post from.
     * @return {IPostContainerDTO[]} - Found posts.
     */
    async getExternalPosts({ location, userId }: { location: string; userId: string }): Promise<IPostContainerDTO[]> {
        const destinationUrl = `http://[${location}]/api/v2/posts/${userId}?external=true`;
        try {
            return (
                await axios.get<IPostContainerDTO[]>(destinationUrl, {
                    timeout: parseInt(this._configService.get<string>('bigPingTimeoutAxiosRequest')),
                })
            ).data;
        } catch (error) {
            return;
        }
    }

    /**
     * Likes an external post.
     * @param {Object} obj - Object.
     * @param {string} obj.location - IPv6 location to get the post from.
     * @param {LikePostDTO} obj.likePost - Like post DTO.
     * @param {string} obj.postId - Post Id to lik.e
     * @return {IPostContainerDTO} - Liked post.
     */
    async likeExternalPost({
        location,
        likePostDTO,
        postId,
    }: {
        location: string;
        likePostDTO: LikePostDTO;
        postId: string;
    }): Promise<{ status: string }> {
        const destinationUrl = `http://[${location}]/api/v2/posts/like/${postId}`;
        try {
            return (await axios.put<{ status: string }>(destinationUrl, likePostDTO)).data;
        } catch (error) {
            throw new BadRequestException(`unable to get like post: ${error}`);
        }
    }

    /**
     * Sends a typing event to the post owner, so the owner can send it to his contacts.
     * @param {Object} obj - Object.
     * @param {string} obj.location - IPv6 location to send event to.
     * @param {string} obj.typingDTO - TypingDTO.
     */
    async handleTyping({
        location,
        typingDTO,
    }: {
        location: string;
        typingDTO: TypingDTO;
    }): Promise<{ post: string; user: string }> {
        const destinationUrl = `http://[${location}]/api/v2/posts/typing`;
        try {
            return (await axios.put<{ post: string; user: string }>(destinationUrl, typingDTO)).data;
        } catch (error) {
            throw new BadRequestException(`unable to handle typing: ${error}`);
        }
    }

    /**
     * Sends a typing event to given contact location.
     * @param {Object} obj - Object.
     * @param {string} obj.location - IPv6 contact location.
     * @param {string} obj.typingDTO - TypingDTO.
     * @return {boolean} - True if success.
     */
    async sendSomeoneIsTyping({ location, typingDTO }: { location: string; typingDTO: TypingDTO }): Promise<boolean> {
        const destinationUrl = `http://[${location}]/api/v2/posts/someone-is-typing`;
        try {
            return (await axios.post<boolean>(destinationUrl, typingDTO)).data;
        } catch (error) {
            throw new BadRequestException(`unable to send typing event: ${error}`);
        }
    }

    /**
     * Sends comment request to external post.
     * @param {Object} obj - Object.
     * @param {string} obj.location - IPv6 contact location.
     * @param {string} obj.commentDTO - CommentDTO.
     * @return {boolean} - True if success.
     */
    async commentOnExternalPost({
        location,
        commentDTO,
    }: {
        location: string;
        commentDTO: IPostComment;
    }): Promise<{ status: string }> {
        const destinationUrl = `http://[${location}]/api/v2/posts/comment/react/${commentDTO.post.id}`;
        try {
            return (await axios.put<{ status: string }>(destinationUrl, commentDTO)).data;
        } catch (error) {
            throw new BadRequestException(`unable to comment on external post: ${error}`);
        }
    }

    /**
     * Lets the other twin know that the connection request was accepted.
     * @param {Object} obj - Object.
     * @param {string} obj.ownId - Your own id
     * @param {string} obj.contactLocation - IPv6 location to send event to.
     * @return {boolean} - True if success.
     */
    async acceptContactRequest({
        ownId,
        contactLocation,
    }: {
        ownId: string;
        contactLocation: string;
    }): Promise<boolean> {
        const destinationUrl = `http://[${contactLocation}]/api/v2/contacts/accept/${ownId}`;
        try {
            return (await axios.put<boolean>(destinationUrl)).data;
        } catch (error) {
            throw new BadRequestException(`unable to accept contact request: ${error}`);
        }
    }

    /**
     * Lets the other twin know that he was removed as a contact.
     * @param {Object} obj - Object.
     * @param {string} obj.ownId - Your own id
     * @param {string} obj.contactLocation - IPv6 location to send event to.
     * @return {boolean} - True if success.
     */
    async deleteContact({ ownId, location }: { ownId: string; location: string }): Promise<boolean> {
        const destinationUrl = `http://[${location}]/api/v2/contacts/delete/${ownId}`;
        try {
            return (await axios.put<boolean>(destinationUrl)).data;
        } catch (error) {
            return;
        }
    }

    /**
     * Fetches data from url
     * @param {string} url- Url.
     */
    async getUrlPreview({ url }: { url: string }) {
        try {
            const { data } = await axios.get(url);

            const htmlDoc = parse(data);

            const propertyList = [];

            const title = getURLTitle(htmlDoc).toString();

            propertyList.push({
                title: title == 'Title not found' ? url.toString().split('.')[1] : title,
                description: getURLDescription(htmlDoc).toString(),
                link: url,
            });

            return propertyList;
        } catch (error) {
            throw new BadRequestException(`unable to get url preview: ${error}`);
        }
    }

    /**
     * Retries failed axios requests.
     */
    async retryFailedRequests() {
        const failedRequests = await this._failedRequestRepository.getFailedRequests();
        console.log(`FAILED REQUESTS: ${failedRequests.length}`);
        if (failedRequests.length < 1) return;
        console.info(`retrying [${failedRequests.length}] failed requests...`);
        Promise.all(
            failedRequests.map(async request => {
                const { location, requestParams } = request;
                console.info(`retrying request to: [${location}]...`);
                try {
                    const res = await axios(requestParams);
                    if (res.status === 200) {
                        const reqToDelete = failedRequests.find(r => r.location !== location);
                        if (reqToDelete) await this._failedRequestRepository.deleteFailedRequest(reqToDelete.entityId);
                    }
                } catch (error) {
                    return;
                }
            })
        );
    }

    /**
     * Retries long awaited (7 days or more) failed axios requests.
     */
    async retryLongAwaitedFailedRequests() {
        const longAwaitedFailedRequests = await this._failedRequestRepository.getLongAwaitedFailedRequests();
        if (longAwaitedFailedRequests.length < 1) return;
        console.info(`retrying [${longAwaitedFailedRequests.length}] long awaited failed requests...`);
        Promise.all(
            longAwaitedFailedRequests.map(async request => {
                const { location, requestParams } = request;
                try {
                    const res = await axios(requestParams);
                    if (res.status === 200) {
                        const reqToDelete = longAwaitedFailedRequests.find(r => r.location !== location);
                        if (reqToDelete) await this._failedRequestRepository.deleteFailedRequest(reqToDelete.entityId);
                    }
                } catch (error) {
                    return;
                }
            })
        );
    }

    /**
     * Let the other twin know that a post has been deleted.
     * @param {Object} obj - Object.
     * @param {string} obj.location - IPv6 location to send message to.
     * @param {string} obj.postId - Post id that has been deleted.
     */
    async deletePost({ location, postId }: { location: string; postId: string }) {
        const url = `http://[${location}]/api/v2/posts/${postId}`;
        try {
            return (await axios.delete(url)).data;
        } catch {
            return;
        }
    }

    async containerHealth(location: string): Promise<boolean> {
        const url = `http://[${location}]/api/v2/container/health`;
        try {
            return (
                await axios.get(url, {
                    timeout: parseInt(this._configService.get<string>('smallPingTimeoutAxiosRequest')),
                })
            ).data;
        } catch {
            return false;
        }
    }

    /**
     * Clears the failed requests array.
     */
    // async clearFailedRequests() {
    //     const failedRequests = await this._failedRequestRepository.getFailedRequests();
    //     if (failedRequests.length < 1) return;
    //     Promise.all(
    //         failedRequests.map(async request => {
    //             if (request.lastAttempt < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
    //                 await this._failedRequestRepository.deleteFailedRequest(request.entityId);
    //             }
    //         })
    //     );
    // }
    likeExternalComment({ likeCommentDTO, location }: { likeCommentDTO: LikeCommentDTO; location: string }) {
        const url = `http://[${location}]/api/v2/posts/comment/like`;
        try {
            return axios.put(url, likeCommentDTO);
        } catch {
            return;
        }
    }

    async deleteExternalComment({ deleteCommentDTO }: { deleteCommentDTO: DeleteCommentDTO }) {
        const location = deleteCommentDTO.ownerLocation;
        const url = `http://[${location}]/api/v2/posts/comment/delete`;
        try {
            return (
                await axios.delete(url, {
                    data: deleteCommentDTO,
                })
            ).data;
        } catch {
            return;
        }
    }

    async getExternalFileInfo({
        path,
        attachments,
        location,
    }: {
        path: string;
        attachments: boolean;
        location: string;
    }) {
        const url = `http://[${location}]/api/v2/quantum/file/info`;
        const params = new URLSearchParams();
        params.append('path', path);
        params.append('attachments', attachments.toString());
        params.append('location', location);
        try {
            return (
                await axios.get(url, {
                    params,
                    timeout: parseInt(this._configService.get<string>('bigPingTimeoutAxiosRequest')),
                })
            ).data;
        } catch {
            return;
        }
    }

    async saveIdentifierToExternal(data: PostIdentificationDto, encodedHeader: string) {
        const userId = await this._configService.get<string>('userId');

        try {
            await axios.post(
                'https://europe-west2-jimberlabs.cloudfunctions.net/api/identify',
                {
                    username: userId,
                    appId: data.appId,
                    identifier: data.identifier,
                },
                {
                    headers: {
                        'Jimber-Authorization': encodedHeader,
                    },
                }
            );
        } catch (e) {
            console.log(e);
            return;
        }
    }

    async postNotificationToExternal(data: PostNotificationDto, encodedHeader: string) {
        try {
            await axios.post('https://europe-west2-jimberlabs.cloudfunctions.net/api/notification', data, {
                headers: {
                    'Jimber-Authorization': encodedHeader,
                },
            });
        } catch (e) {
            console.log(e);
            return;
        }
    }

    async setContactAccepted(userId: string, location: string, accepted: boolean) {
        const destinationUrl = `http://[${location}]/api/v2/contacts/${accepted}/${userId}`;
        try {
            return (await axios.put<boolean>(destinationUrl)).data;
        } catch (error) {
            return;
        }
    }
}
