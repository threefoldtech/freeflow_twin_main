import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';

import { AuthGuard } from '../../guards/auth.guard';
import { BlockedContactService } from './blocked-contact.service';
import { CreateBlockedContactDTO } from './dtos/blocked-contact.dto';

@Controller('blocked')
export class BlockedContactController {
    constructor(private readonly _blockedContacService: BlockedContactService) {}

    @Post()
    @UseGuards(AuthGuard)
    async addBlockedContact(@Body() createBlockedContactDTO: CreateBlockedContactDTO): Promise<string> {
        return await this._blockedContacService.addBlockedContact({
            id: createBlockedContactDTO.id,
        });
    }

    @Get()
    async getBlockedContacts(): Promise<string[]> {
        return await this._blockedContacService.getBlockedContactList();
    }

    @Delete(':id')
    @UseGuards(AuthGuard)
    async deleteBlockedContact(@Param() { id }: { id: string }) {
        return await this._blockedContacService.deleteBlockedContact({ id });
    }
}
