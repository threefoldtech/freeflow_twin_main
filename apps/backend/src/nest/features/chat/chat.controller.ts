import { BadRequestException, Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';

import { AuthGuard } from '../../guards/auth.guard';
import { ChatService } from './chat.service';
import { ChatDTO, CreateChatDTO, GroupChatDTO } from './dtos/chat.dto';

@Controller('chats')
export class ChatController {
    constructor(private readonly _chatService: ChatService) {}

    @Post()
    @UseGuards(AuthGuard)
    async acceptChatRequest(@Query('id') id: string) {
        if (!id) throw new BadRequestException('please provice a valid chat id');
        return await this._chatService.acceptChatRequest(id);
    }

    @Post('group')
    @UseGuards(AuthGuard)
    async createGroupChat(@Body() groupChatDTO: GroupChatDTO) {
        await this._chatService.createGroupChat(groupChatDTO);
        return { success: true };
    }

    @Post('group/invite')
    @UseGuards(AuthGuard)
    async acceptGroupInvite(@Body() createChatDTO: CreateChatDTO) {
        await this._chatService.acceptGroupInvite(createChatDTO);
        return { success: true };
    }

    @Get()
    @UseGuards(AuthGuard)
    async getAllChats(@Query('offset') offset = 0, @Query('count') count = 50): Promise<ChatDTO[]> {
        return await this._chatService.getChats({ offset, count });
    }

    @Get('accepted')
    @UseGuards(AuthGuard)
    async getAcceptedChats(@Query('offset') offset = 0, @Query('count') count = 50): Promise<ChatDTO[]> {
        return await this._chatService.getAcceptedChats({ offset, count });
    }
}
