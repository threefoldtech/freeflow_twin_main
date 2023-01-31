import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { IFileShareMessage, MessageType, QuoteBodyType, StringMessageType } from '../../types/message-types';
import { ChatGateway } from '../chat/chat.gateway';
import { Chat } from '../chat/models/chat.model';
import { ContactDTO } from '../contact/dtos/contact.dto';
import { KeyService } from '../key/key.service';
import { CreateMessageDTO, MessageDTO } from './dtos/message.dto';
import { Message } from './models/message.model';
import { MessageRedisRepository } from './repositories/message-redis.repository';
import { ChatService } from '../chat/chat.service';
import { FirebaseService } from '../firebase/firebase.service';
import { debounceFunction } from '../../utils/debounce';
import { PostNotificationDto } from '../firebase/dtos/firebase.dtos';

@Injectable()
export class MessageService {
    private userId: string;
    private _notificationCount: number = 0;

    constructor(
        private readonly _messageRepo: MessageRedisRepository,
        private readonly _configService: ConfigService,
        private readonly _keyService: KeyService,
        @Inject(forwardRef(() => ChatGateway))
        private readonly _chatGateway: ChatGateway,
        @Inject(forwardRef(() => ChatService))
        private readonly _chatService: ChatService,
        @Inject(forwardRef(() => FirebaseService))
        private readonly _firebaseService: FirebaseService
    ) {
        this.userId = this._configService.get<string>('userId');
    }

    /**
     * Creates a new message.
     * @param {CreateMessageDTO} createMessageDTO - CreateMessageDTO.
     * @return {Message} - Created message.
     */
    async createMessage<T>(createMessageDTO: CreateMessageDTO<T>): Promise<Message> {
        try {
            console.log(createMessageDTO.timeStamp);
            const existingMessage = await this._messageRepo.findMessageById(createMessageDTO.id);
            if (existingMessage) return;
            return await this._messageRepo.createMessage(createMessageDTO);
        } catch (error) {
            throw new BadRequestException(`unable to create message: ${error}`);
        }
    }

    /**
     * Gets messages from given chat Id using pagination.
     * @param {Object} obj - Object.
     * @param {string} obj.chatId - Chat Id to get messages from.
     * @param {number} obj.offset - Pagination offset.
     * @param {number} obj.count - Pagination count.
     */
    async getMessagesFromChat({
        chatId,
        count,
        totalMessagesLoaded = 0,
    }: {
        chatId: string;
        count: number;
        totalMessagesLoaded?: number;
    }): Promise<MessageDTO<unknown>[]> {
        try {
            const messages = (
                await this._messageRepo.getMessagesFromChat({
                    chatId,
                    offset: totalMessagesLoaded,
                    count,
                })
            ).map(m => m.toJSON());
            return messages.sort((a, b) => a.timeStamp.getTime() - b.timeStamp.getTime());
        } catch (error) {
            throw new BadRequestException(`unable to fetch messages from chat: ${error}`);
        }
    }

    /**
     * Deletes messages from given chat Id.
     * @param {Object} obj - Object.
     * @param {string} obj.chatId - Chat Id to delete messages from.
     */
    async deleteMessagesFromChat({ chatId }: { chatId: string }): Promise<void> {
        try {
            return await this._messageRepo.deleteMessagesFromChat(chatId);
        } catch (error) {
            throw new BadRequestException(`unable to delete messages from chat: ${error}`);
        }
    }

    async deleteMessage({ messageId }: { messageId: string }): Promise<boolean> {
        try {
            return await this._messageRepo.deleteMessage({ id: messageId });
        } catch (error) {
            throw new BadRequestException(`unable to delete message: ${error}`);
        }
    }

    async deleteShareMessages({ chatId, shareId }: { chatId: string; shareId: string }) {
        const shareMessages = (await this.getAllMessagesFromChat({ chatId }))
            .filter(msg => msg.type === MessageType.FILE_SHARE)
            .filter(msg => (JSON.parse(msg.body) as IFileShareMessage).id === shareId);

        for (const msg of shareMessages) {
            await this.deleteMessage({ messageId: msg.id });
            msg.type = MessageType.DELETE;
            msg.body = 'Share has been deleted';
            this._chatGateway.emitMessageToConnectedClients('message', msg);
        }
    }

    /**
     * Verifies a message's signature.
     * @param {Object} obj - Object.
     * @param {boolean} obj.isGroup - Is group chat or not.
     * @param {Contact} obj.admin - Admin contact.
     * @param {Contact} obj.from - From contact.
     * @param {MessageDTO} obj.signedMessage - Signed message to verify.
     * @return {boolean} - Valid signature or not.
     */
    async verifySignedMessage<T>({
        isGroup,
        adminContact,
        fromContact,
        signedMessage,
    }: {
        isGroup: boolean;
        adminContact?: ContactDTO;
        fromContact?: ContactDTO;
        signedMessage: MessageDTO<T>;
    }): Promise<boolean> {
        let signatureIdx = 0;

        if (!fromContact) return false;

        const userID = this._configService.get<string>('userId');
        if (isGroup && adminContact?.id !== userID) {
            const adminVerified = await this._keyService.verifyMessageSignature({
                contact: adminContact,
                message: signedMessage,
                signature: signedMessage.signatures[signatureIdx],
            });
            if (!adminVerified) return false;
            signatureIdx++;
        }

        return await this._keyService.verifyMessageSignature({
            contact: fromContact,
            message: signedMessage,
            signature: signedMessage.signatures[signatureIdx],
        });
    }

    /**
     * Verifies a message's signature by given chat.
     * @param {Object} obj - Object.
     * @param {Chat} obj.chat - Chat containing message.
     * @param {MessageDTO} obj.signedMessage - Signed message to verify.
     * @return {boolean} - Valid signature or not.
     */
    async verifySignedMessageByChat<T>({
        chat,
        signedMessage,
    }: {
        chat: Chat;
        signedMessage: MessageDTO<T>;
    }): Promise<boolean> {
        const contacts = chat.parseContacts();
        const adminContact = contacts.find(c => c.id === chat.adminId);
        const fromContact = contacts.find(c => c.id === signedMessage.from);
        return this.verifySignedMessage({ isGroup: chat.isGroup, adminContact, fromContact, signedMessage });
    }

    async getAllMessagesFromChat({ chatId }: { chatId: string }): Promise<Message[]> {
        try {
            const messages = await this._messageRepo.getAllMessagesFromChat({ chatId });
            return messages.sort((a, b) => a.timeStamp.getTime() - b.timeStamp.getTime());
        } catch (error) {
            return [];
        }
    }

    async editMessage({ messageId, text }: { messageId: string; text: string }) {
        try {
            const message = await this._messageRepo.findMessageById(messageId);
            message.body = text;
            await this._messageRepo.updateMessage({ message });
            this.renameQuotedStringMessages(message);
            return message.toJSON();
        } catch (error) {
            throw new BadRequestException(`unable to edit message: ${error}`);
        }
    }

    async renameQuotedFileShareMessages(message: MessageDTO<IFileShareMessage>) {
        const msgReferences = (await this.getAllMessagesFromChat({ chatId: message.chatId }))
            .filter(msg => msg.type === MessageType.QUOTE)
            .filter(msg => (JSON.parse(msg.body) as QuoteBodyType).quotedMessage.body.id === message.body.id);
        Promise.all(
            msgReferences.map(async msg => {
                const parsedMsgBody = JSON.parse(msg.body) as QuoteBodyType;
                msg.body = JSON.stringify({
                    ...parsedMsgBody,
                    quotedMessage: {
                        ...message,
                        id: parsedMsgBody.quotedMessage.id,
                        type: parsedMsgBody.quotedMessage.type,
                    },
                });
                await this._messageRepo.updateMessage({ message: msg });
            })
        );
    }

    async renameQuotedStringMessages(message: MessageDTO<StringMessageType | QuoteBodyType>) {
        const msgReferences = (await this.getAllMessagesFromChat({ chatId: message.chatId }))
            .filter(msg => msg.type === MessageType.QUOTE)
            .filter(msg => (JSON.parse(msg.body) as QuoteBodyType).quotedMessage?.id === message.id);
        Promise.all(
            msgReferences.map(async msg => {
                msg.body = JSON.stringify({
                    ...JSON.parse(msg.body),
                    quotedMessage: message,
                });
                await this._messageRepo.updateMessage({
                    message: msg,
                });
            })
        );
    }

    async renameSharedMessage({ message, chatId }: { message: MessageDTO<IFileShareMessage>; chatId: string }) {
        const msgReferences = (await this.getAllMessagesFromChat({ chatId }))
            .filter(msg => msg.type === MessageType.FILE_SHARE)
            .filter(msg => (JSON.parse(msg.body) as IFileShareMessage).id === message.body.id);
        Promise.all(
            msgReferences.map(async msg => {
                msg.body = JSON.stringify(message.body);
                await this._messageRepo.updateMessage({
                    message: msg,
                });
            })
        );
    }

    /**
     * Determines chat ID for given message.
     * @param {MessageDTO} message - Message to determine chat ID from.
     * @return {string} - Chat ID.
     */
    determineChatID<T>({ to, from }: MessageDTO<T>): string {
        if (to === this._configService.get<string>('userId')) return from;
        return to;
    }

    async notifyIfUnread(message: MessageDTO<unknown>, chatId: string): Promise<void> {
        const userId = this._configService.get<string>('userId');
        if (message.from == userId) return;

        if (message.type === MessageType.READ) return;
        const newChat = await this._chatService.getChat(chatId);

        const lastReadMessageId = newChat.parseRead()?.find(u => u.userId === userId)?.messageId;

        const allMessages = await this.getMessagesFromChat({ chatId: chatId, count: 50, totalMessagesLoaded: 0 });

        const lastReadMessageIdx = allMessages.findIndex((m: MessageDTO<unknown>) => m.id === lastReadMessageId);
        const currentMessageIdx = allMessages.findIndex((m: MessageDTO<unknown>) => m.id === message.id);

        // When having more than 1 unread message
        if (lastReadMessageIdx > currentMessageIdx) return;

        if (lastReadMessageId === message.id) return;

        this._notificationCount++;

        // Make system which does not trigger everytime a new notification for each message
        debounceFunction(() => {
            if (this._notificationCount !== 0) {
                console.log('I will trigger a notification with notificationCount: ', this._notificationCount);
                const postMessage: PostNotificationDto = {
                    timestamp: message.timeStamp.toString(),
                    message: `You have unread messages`,
                    sender: message.from,
                    group: newChat.isGroup.toString(),
                    me: userId,
                    appId: this._configService.get('appId'),
                };

                this._firebaseService.notifyUserInMicroService(postMessage);
                this._notificationCount = 0;
            }
        }, 15000);
    }
}
