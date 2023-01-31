import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { EntityData } from 'redis-om';

import { AuthGuard } from '../../guards/auth.guard';
import { MessageBody } from '../../types/message-types';
import { ContactService } from './contact.service';
import { CreateContactDTO } from './dtos/contact.dto';
import { Contact } from './models/contact.model';

@Controller('contacts')
export class ContactController {
    constructor(private readonly _contactService: ContactService) {}

    @Get()
    @UseGuards(AuthGuard)
    async getContacts(): Promise<EntityData[]> {
        return (await this._contactService.getContacts()).map(c => c.entityData);
    }

    @Post()
    @UseGuards(AuthGuard)
    async createContact(@Body() body: CreateContactDTO<MessageBody>): Promise<Contact> {
        return await this._contactService.createNewContact(body);
    }

    @Put('accept/:userId')
    async acceptRequest(@Param() { userId }: { userId: string }): Promise<Contact> {
        return await this._contactService.updateContact({
            id: userId,
            contactRequest: false,
            accepted: true,
            containerOffline: false,
        });
    }

    @Put('delete/:userId')
    async deleteContact(@Param() { userId }: { userId: string }): Promise<Contact> {
        return await this._contactService.updateContact({
            id: userId,
            contactRequest: false,
            accepted: false,
            containerOffline: false,
        });
    }

    @Put(':accepted/:userId')
    async setContactAccepted(@Param() { userId, accepted }: { userId: string; accepted: string }): Promise<Contact> {
        return await this._contactService.updateContact({
            id: userId,
            contactRequest: false,
            accepted: accepted === 'true',
            containerOffline: false,
        });
    }
}
