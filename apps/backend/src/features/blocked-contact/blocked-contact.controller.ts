import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';

import { AuthGuard } from '../../guards/auth.guard';
import { BlockedContactService } from './blocked-contact.service';
import { CreateBlockedContactDTO } from './dtos/blocked-contact.dto';

@Controller('blocked')
export class BlockedContactController {
    constructor(private readonly _blockedContactService: BlockedContactService) {}

    @Post()
    @UseGuards(AuthGuard)
    async addBlockedContact(@Body() createBlockedContactDTO: CreateBlockedContactDTO): Promise<string> {
        return await this._blockedContactService.addBlockedContact({
            id: createBlockedContactDTO.id,
        });
    }

    @Get()
    async getBlockedContacts(): Promise<string[]> {
        return await this._blockedContactService.getBlockedContactIds();
    }

    @Get(':id')
    async isBlocked(@Param('id') id: string): Promise<boolean> {
        const blockedContacts = await this._blockedContactService.getBlockedContactIds();
        return blockedContacts.includes(id);
    }
}
