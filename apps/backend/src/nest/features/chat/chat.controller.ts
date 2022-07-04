import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';

import { AuthGuard } from '../../guards/auth.guard';
import { MessageDTO } from '../message/dtos/message.dto';
import { ChatService } from './chat.service';
import { ChatDTO, CreateChatDTO, CreateGroupChatDTO } from './dtos/chat.dto';

@Controller('chats')
export class ChatController {
    constructor(private readonly _chatService: ChatService) {}

    @Post()
    @UseGuards(AuthGuard)
    async acceptChatRequest(@Query('id') id: string): Promise<ChatDTO> {
        if (!id) throw new BadRequestException('please provice a valid chat id');
        return await this._chatService.acceptChatRequest(id);
    }

    @Post('group')
    @UseGuards(AuthGuard)
    async createGroupChat(@Body() groupChatDTO: CreateGroupChatDTO): Promise<{ success: boolean }> {
        await this._chatService.createGroupChat(groupChatDTO);
        return { success: true };
    }

    @Post('group/invite')
    @UseGuards(AuthGuard)
    async acceptGroupInvite(@Body() createChatDTO: CreateChatDTO): Promise<{ success: boolean }> {
        await this._chatService.acceptGroupInvite(createChatDTO);
        return { success: true };
    }

    @Put('draft')
    @UseGuards(AuthGuard)
    async updateDraft(@Body() draftMessage: MessageDTO<unknown>): Promise<ChatDTO> {
        if (!draftMessage) throw new BadRequestException('please provide a valid draft message');

        return await this._chatService.updateDraft({ draftMessage });
    }

    @Get()
    @UseGuards(AuthGuard)
    async getAllChats(@Query('offset') offset = 0, @Query('count') count = 50): Promise<ChatDTO[]> {
        return await this._chatService.getChats({ offset, count });
    }

    @Get('chatId')
    @UseGuards(AuthGuard)
    async getChat(@Param('id') id: string): Promise<ChatDTO> {
        return (await this._chatService.getChat(id)).toJSON();
    }

    @Get('accepted')
    @UseGuards(AuthGuard)
    async getAcceptedChats(@Query('offset') offset = 0, @Query('count') count = 50): Promise<ChatDTO[]> {
        return await this._chatService.getAcceptedChats({ offset, count });
    }

    @Delete(':id')
    async deleteChat(@Param('id') id: string): Promise<void> {
        return await this._chatService.deleteChat(id);
    }
}
