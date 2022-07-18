// @ts-nocheck
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import axios from 'axios';
import { IFileShareMessage, MessageType } from '../../types/message-types';
import { Chat } from '../chat/models/chat.model';
import { ContactDTO } from '../contact/dtos/contact.dto';
import { KeyService } from '../key/key.service';
import { CreateMessageDTO, MessageDTO } from './dtos/message.dto';
import { Message } from './models/message.model';
import { MessageRedisRepository } from './repositories/message-redis.repository';

@Injectable()
export class MessageService {
    private userId: string;

    constructor(
        private readonly _messageRepo: MessageRedisRepository,
        private readonly _configService: ConfigService,
        private readonly _keyService: KeyService
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
        offset,
        count,
    }: {
        chatId: string;
        offset: number;
        count: number;
    }): Promise<MessageDTO<unknown>[]> {
        try {
            const messages = (await this._messageRepo.getMessagesFromChat({ chatId, offset, count })).map(m =>
                m.toJSON()
            );
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
            message.body = JSON.stringify(text);
            await this._messageRepo.updateMessage({ message });
            return message.toJSON();
        } catch (error) {
            throw new BadRequestException(`unable to edit message: ${error}`);
        }
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

    /**
     * Fetches data from url
     * @param {string} url- Url.
     */
    async getUrlPreview({ url }: { url: string }): Promise<any> {
        console.log('huts', url);
        try {
            const response = await axios.get(url);
            return response.data;
            const parser = new DOMParser();
            const doc = parser.parseFromString(data, 'text/html');

            console.log(doc);

            const propertyList = [];

            const dataList = {
                title: this.getTitle(doc),
                description: this.getDescription(doc),
            };

            propertyList.push(dataList);
            return propertyList;
        } catch (error) {
            throw new BadRequestException(`unable to get url preview: ${error}`);
        }

        // const browser = await puppeteer.launch({
        //     headless: false,
        //     executablePath: "/Applications/Chromium.app/Contents/MacOS/Chromium",
        //     args: [
        //         "--disable-gpu",
        //         "--disable-dev-shm-usage",
        //         "--disable-setuid-sandbox",
        //         "--no-sandbox",
        //     ]
        // });
        // const page = await browser.newPage();
        // await page.goto(url, {
        //     waitUntil: 'networkidle2',
        // });

        // await browser.close();
    }

    //   getImg = async (page, uri) => {
    //     const img = await page.evaluate(async () => {
    //       const ogImg = document.querySelector('meta[property="og:image"]');
    //       if (
    //         ogImg != null &&
    //         ogImg.content.length > 0 &&
    //         (await urlImageIsAccessible(ogImg.content))
    //       ) {
    //         return ogImg.content;
    //       }
    //       const imgRelLink = document.querySelector('link[rel="image_src"]');
    //       if (
    //         imgRelLink != null &&
    //         imgRelLink.href.length > 0 &&
    //         (await urlImageIsAccessible(imgRelLink.href))
    //       ) {
    //         return imgRelLink.href;
    //       }
    //       const twitterImg = document.querySelector('meta[name="twitter:image"]');
    //       if (
    //         twitterImg != null &&
    //         twitterImg.content.length > 0 &&
    //         (await urlImageIsAccessible(twitterImg.content))
    //       ) {
    //         return twitterImg.content;
    //       }

    //       let imgs = Array.from(document.getElementsByTagName("img"));
    //       if (imgs.length > 0) {
    //         imgs = imgs.filter((img) => {
    //           let addImg = true;
    //           if (img.naturalWidth > img.naturalHeight) {
    //             if (img.naturalWidth / img.naturalHeight > 3) {
    //               addImg = false;
    //             }
    //           } else {
    //             if (img.naturalHeight / img.naturalWidth > 3) {
    //               addImg = false;
    //             }
    //           }
    //           if (img.naturalHeight <= 50 || img.naturalWidth <= 50) {
    //             addImg = false;
    //           }
    //           return addImg;
    //         });
    //         if (imgs.length > 0) {
    //           imgs.forEach((img) =>
    //             img.src.indexOf("//") === -1
    //               ? (img.src = `${new URL(uri).origin}/${img.src}`)
    //               : img.src
    //           );
    //           return imgs[0].src;
    //         }
    //       }
    //       return null;
    //     });
    //     return img;
    //   };

    getTitle = (data: any) => {
        const ogTitle = data.querySelector('meta[property="og:title"]');
        if (ogTitle != null && ogTitle.content.length > 0) {
            return ogTitle.content;
        }
        const twitterTitle = data.querySelector('meta[name="twitter:title"]');
        if (twitterTitle != null && twitterTitle.content.length > 0) {
            return twitterTitle.content;
        }
        const docTitle = data.title;
        if (docTitle != null && docTitle.length > 0) {
            return docTitle;
        }
        const h1El = data.querySelector('h1');
        const h1 = h1El ? h1El.innerHTML : null;
        if (h1 != null && h1.length > 0) {
            return h1;
        }
        const h2El = data.querySelector('h2');
        const h2 = h2El ? h2El.innerHTML : null;
        if (h2 != null && h2.length > 0) {
            return h2;
        }
        return null;
    };

    getDescription = (data: any) => {
        const ogDescription = data.querySelector('meta[property="og:description"]');
        if (ogDescription != null && ogDescription.content.length > 0) {
            return ogDescription.content;
        }
        const twitterDescription = data.querySelector('meta[name="twitter:description"]');
        if (twitterDescription != null && twitterDescription.content.length > 0) {
            return twitterDescription.content;
        }
        const metaDescription = data.querySelector('meta[name="description"]');
        if (metaDescription != null && metaDescription.content.length > 0) {
            return metaDescription.content;
        }
        let paragraphs = data.querySelectorAll('p');
        let fstVisibleParagraph = null;
        for (let i = 0; i < paragraphs.length; i++) {
            if (
                // if object is visible in dom
                paragraphs[i].offsetParent !== null &&
                !paragraphs[i].childElementCount != 0
            ) {
                fstVisibleParagraph = paragraphs[i].textContent;
                break;
            }
        }
        return fstVisibleParagraph;
    };

    // getDomainName = async (page : any, uri) => {
    //     const domainName = await page.evaluate(() => {
    //       const canonicalLink = document.querySelector("link[rel=canonical]");
    //       if (canonicalLink != null && canonicalLink.href.length > 0) {
    //         return canonicalLink.href;
    //       }
    //       const ogUrlMeta = document.querySelector('meta[property="og:url"]');
    //       if (ogUrlMeta != null && ogUrlMeta.content.length > 0) {
    //         return ogUrlMeta.content;
    //       }
    //       return null;
    //     });
    //     return domainName != null
    //       ? new URL(domainName).hostname.replace("www.", "")
    //       : new URL(uri).hostname.replace("www.", "");
    //   };

    // getFavicon = async (page, uri) => {
    //     const noLinkIcon = `${new URL(uri).origin}/favicon.ico`;
    //     if (await urlImageIsAccessible(noLinkIcon)) {
    //       return noLinkIcon;
    //     }

    //     const favicon = await page.evaluate(async () => {
    //       const icon16Sizes = document.querySelector('link[rel=icon][sizes="16x16"]');
    //       if (
    //         icon16Sizes &&
    //         icon16Sizes.href.length > 0 &&
    //         (await urlImageIsAccessible(icon16Sizes.href))
    //       ) {
    //         return icon16Sizes.href;
    //       }

    //       const shortcutIcon = document.querySelector('link[rel="shortcut icon"]');
    //       if (
    //         shortcutIcon &&
    //         shortcutIcon.href.length > 0 &&
    //         (await urlImageIsAccessible(shortcutIcon.href))
    //       ) {
    //         return shortcutIcon.href;
    //       }

    //       const icons = document.querySelectorAll("link[rel=icon]");
    //       for (let i = 0; i < icons.length; i++) {
    //         if (
    //           icons[i] &&
    //           icons[i].href.length > 0 &&
    //           (await urlImageIsAccessible(icons[i].href))
    //         ) {
    //           return icons[i].href;
    //         }
    //       }

    //       const appleTouchIcons = document.querySelectorAll('link[rel="apple-touch-icon"],link[rel="apple-touch-icon-precomposed"]');
    //       for (let i = 0; i < appleTouchIcons.length; i ++) {
    //         if (
    //           appleTouchIcons[i] &&
    //           appleTouchIcons[i].href.length > 0 &&
    //           (await urlImageIsAccessible(appleTouchIcons[i].href))
    //         ) {
    //           return appleTouchIcons[i].href;
    //         }
    //       }

    //       return null;
    //     })

    //     return favicon;
    //   }
}
