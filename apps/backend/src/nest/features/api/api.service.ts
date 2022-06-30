import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { ResponseType } from 'axios';
import { IPostComment, IPostContainerDTO } from 'custom-types/post.type';
import { IStatusUpdate } from 'custom-types/status.type';

import Contact from '../../../models/contact';
import { ChatDTO } from '../chat/dtos/chat.dto';
import { MessageDTO } from '../message/dtos/message.dto';
import { LikePostDTO } from '../post/dtos/request/like-post.dto';
import { TypingDTO } from '../post/dtos/request/typing.dto';

@Injectable()
export class ApiService {
    constructor(private readonly _configService: ConfigService) {}

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
    async sendMessageToApi({
        location,
        message,
        responseType,
    }: {
        location: string;
        message: MessageDTO<unknown>;
        responseType?: ResponseType;
    }) {
        try {
            return await axios.put(`http://[${location}]/api/v2/messages`, message, {
                responseType: responseType || 'json',
                timeout: 5000,
            });
        } catch {
            return;
        }
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
                timeout: 5000,
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
            throw new BadRequestException(`unable to delete chat: ${error}`);
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
        } catch (error) {
            throw new BadRequestException(`unable to send group invitation: ${error}`);
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
            const res = await axios.get<ChatDTO>(`http://[${location}]/api/v2/chats/${chatId}`);
            return res.data;
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
            return (await axios.get<IPostContainerDTO>(destinationUrl)).data;
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
            return (await axios.get<IPostContainerDTO[]>(destinationUrl)).data;
        } catch (error) {
            throw new BadRequestException(`unable to get external posts: ${error}`);
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
            throw new BadRequestException(`unable to handle typing: ${error}`);
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
        const destinationUrl = `http://[${location}]/api/v2/posts/comment/${commentDTO.post.id}`;
        try {
            return (await axios.put<{ status: string }>(destinationUrl, commentDTO)).data;
        } catch (error) {
            throw new BadRequestException(`unable to handle typing: ${error}`);
        }
    }

    /**
     * Used to talk to other twins.
     * @param {string} resource - Twin to contact with resource.
     */
    // TODO: remove this, last thing that is using this is get status.
    // change this to a function `getContactsStatusList`
    async getExternalResource({ resource }: { resource: string }) {
        try {
            return await axios.get(resource);
        } catch (error) {
            throw new BadRequestException(`unable to get external resource: ${error}`);
        }
    }

    /**
     * Lets the other twin know that the connection request was accepted.
     * @param {Object} obj - Object.
     * @param {string} obj.ownId - Your own id
     * @param {string} obj.contactLocation - IPv6 location to send event to.
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
     @param {Object} obj - Object.
     @param {string} obj.contact - The contact that you deleted.
     */
    async deleteContact({ contact }: { contact: Contact }): Promise<boolean> {
        const ownId = await this._configService.get<string>('userId');
        const destinationUrl = `http://[${contact.location}]/api/v2/contacts/delete/${ownId}`;
        try {
            return (await axios.put<boolean>(destinationUrl)).data;
        } catch (error) {
            throw new BadRequestException(`unable to delete contact: ${error}`);
        }
    }
}
