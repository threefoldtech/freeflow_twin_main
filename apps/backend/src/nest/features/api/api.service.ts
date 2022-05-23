import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { ResponseType } from 'axios';
import { StatusUpdate } from 'types/status.type';

import { ChatDTO } from '../chat/dtos/chat.dto';
import { Chat } from '../chat/models/chat.model';
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

    async sendStatusUpdate({ location, status }: { location: string; status: StatusUpdate }) {
        try {
            return await axios.put(`http://[${location}]/api/v2/user/update-status`, status);
        } catch (error) {
            throw new BadRequestException(`unable to update status: ${error}`);
        }
    }

    /**
     * Sends a group invitation to contacts in chat.
     * @param {Object} obj - Object.
     * @param {string} obj.location - IPv6 location to send invite to.
     * @param {Chat} obj.chat - Chat with contacts to invite.
     * @param {ResponseType} obj.responseType - Axios optional response type.
     */
    async sendGroupInvitation({
        location,
        chat,
        responseType,
    }: {
        location: string;
        chat: Chat;
        responseType?: ResponseType;
    }) {
        try {
            // TODO: change to /nest/group/invite when implemented
            return await axios.put(`http://[${location}]/api/v1/group/invite`, chat, {
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
