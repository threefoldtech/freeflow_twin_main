import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'redis-om';

import { Chat } from '../chat/models/chat.model';
import { ContactDTO } from '../contact/dtos/contact.dto';
import { DbService } from '../db/db.service';
import { KeyService } from '../key/key.service';
import { CreateMessageDTO, MessageDTO } from './dtos/message.dto';
import { Message, messageSchema, stringifyMessageBody, stringifyReplies } from './models/message.model';

@Injectable()
export class MessageService {
    private _messageRepo: Repository<Message>;

    constructor(
        private readonly _dbService: DbService,
        private readonly _configService: ConfigService,
        private readonly _keyService: KeyService
    ) {
        this._messageRepo = this._dbService.createRepository(messageSchema);
        this._messageRepo.createIndex();
    }

    /**
     * Creates a new message.
     * @param {string} id - Contact ID.
     * @param {string} location - Contact IPv6.
     * @return {Contact} - Created entity.
     */
    async createMessage<T>({
        id,
        from,
        to,
        body,
        timeStamp,
        replies,
        subject,
        type,
        signatures,
    }: CreateMessageDTO<T>): Promise<Message> {
        try {
            return await this._messageRepo.createAndSave({
                id,
                from,
                to,
                body: stringifyMessageBody(body),
                timeStamp,
                replies: stringifyReplies(replies),
                subject,
                type,
                signatures: signatures ?? null,
            });
        } catch (error) {
            throw new BadRequestException(`unable to create message: ${error}`);
        }
    }

    /**
     * Verifies a message's signature.
     * @param {boolean} isGroup - Is group chat or not.
     * @param {Contact} admin - Admin contact.
     * @param {Contact} from - From contact.
     * @param {MessageDTO} signedMessage - Signed message to verify.
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
     * @param {Chat} chat - Chat containing message.
     * @param {MessageDTO} signedMessage - Signed message to verify.
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

    /**
     * Determines chat ID for given message.
     * @param {MessageDTO} message - Message to determine chat ID from.
     * @return {string} - Chat ID.
     */
    determineChatID<T>({ to, from }: MessageDTO<T>): string {
        if (to === this._configService.get<string>('userId')) return from;
        return to;
    }
}
