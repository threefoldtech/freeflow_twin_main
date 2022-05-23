import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';

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
    async getContacts(@Query('offset') offset = 0, @Query('count') count = 25): Promise<Contact[]> {
        return await this._contactService.getContacts({ offset, count });
    }

    @Post()
    @UseGuards(AuthGuard)
    async createContact(@Body() body: CreateContactDTO<MessageBody>): Promise<Contact> {
        return await this._contactService.createNewContact(body);
    }
}
