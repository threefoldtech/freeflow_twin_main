import { BadRequestException, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';

import { AuthGuard } from '../../guards/auth.guard';
import { ChatService } from './chat.service';
import { ChatDTO } from './dtos/chat.dto';

@Controller('chats')
export class ChatController {
    constructor(private readonly _chatService: ChatService) {}

    @Post()
    @UseGuards(AuthGuard)
    async acceptChatRequest(@Query('id') id: string) {
        if (!id) throw new BadRequestException('please provice a valid chat id');
        return await this._chatService.acceptChatRequest(id);
    }

    @Get()
    async getAllChats(@Query('offset') offset = 0, @Query('count') count = 50): Promise<ChatDTO[]> {
        return await this._chatService.getChats({ offset, count });
    }

    @Get('accepted')
    async getAcceptedChats(@Query('offset') offset = 0, @Query('count') count = 50): Promise<ChatDTO[]> {
        return await this._chatService.getAcceptedChats({ offset, count });
    }
}
