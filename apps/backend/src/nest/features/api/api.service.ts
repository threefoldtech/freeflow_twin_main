import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { ResponseType } from 'axios';
import { IPostContainerDTO } from 'custom-types/post.type';
import { IStatusUpdate } from 'custom-types/status.type';

import { ChatDTO } from '../chat/dtos/chat.dto';
import { MessageDTO } from '../message/dtos/message.dto';

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
            console.log(`Register Digital Twin called with doubleName: ${doubleName}, signedAddress: ${signedAddress}`);
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
            });
        } catch (error) {
            throw new BadRequestException(`unable to send message: ${error}`);
        }
    }

    async sendStatusUpdate({ location, status }: { location: string; status: IStatusUpdate }) {
        try {
            return await axios.put(`http://[${location}]/api/v2/user/update-status`, status);
        } catch (error) {
            throw new BadRequestException(`unable to update status: ${error}`);
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
            // TODO: change to /nest/messages/:chatId when implemented
            const res = await axios.get<ChatDTO>(`http://[${location}]/api/v1/messages/${chatId}`);
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
     * Used to talk to other twins.
     * @param {string} resource - Twin to contact with resource.
     */
    async getExternalResource({ resource }: { resource: string }) {
        try {
            return await axios.get(resource);
        } catch (error) {
            throw new BadRequestException(`unable to get external resource: ${error}`);
        }
    }
}
