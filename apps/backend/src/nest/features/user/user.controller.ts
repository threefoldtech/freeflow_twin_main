import {
    BadRequestException,
    Body,
    Controller,
    Get,
    Param,
    Post,
    Put,
    StreamableFile,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IStatus, IStatusUpdate } from 'custom-types/status.type';
import fs from 'fs';
import { createReadStream } from 'fs-extra';

import { AuthGuard } from '../../guards/auth.guard';
import { imageFileFilter } from '../../utils/file-filters';
import { LocalFilesInterceptor } from '../file/file.interceptor';
import { KeyService } from '../key/key.service';
import { KeyType } from '../key/models/key.model';
import { UserGateway } from './user.gateway';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
    constructor(
        private readonly _configService: ConfigService,
        private readonly _keyService: KeyService,
        private readonly _userService: UserService,
        private readonly _userGateway: UserGateway
    ) {}

    @Get('publickey')
    @UseGuards(AuthGuard)
    async getPublicKey(): Promise<string> {
        const pk = await this._keyService.getKey({
            keyType: KeyType.Public,
            userId: this._configService.get<string>('userId'),
        });
        return pk.key;
    }

    @Get('status')
    @UseGuards(AuthGuard)
    async getStatus(): Promise<IStatus> {
        const isOnline = (await this._userGateway.getConnections()) > 0 ? true : false;
        const userData = await this._userService.getUserData();
        const avatar = await this._userService.getUserAvatar();
        const user = userData.entityData;

        return {
            ...user,
            avatar,
            isOnline,
        };
    }

    @Put('update-status')
    @UseGuards(AuthGuard)
    async updateContactStatus(@Body() status: IStatusUpdate) {
        this._userGateway.emitMessageToConnectedClients('update_status', status);
        return true;
    }

    @Get('avatar/:avatarId')
    async getAvatar(@Param('avatarId') avatarId: string) {
        // represents uuid for saving the new avatar
        let filePath = `${this._configService.get<string>('baseDir')}user/avatar`;
        if (!fs.existsSync(filePath)) {
            filePath = `${this._configService.get<string>('baseDir')}user/avatar-default`;
        }
        const stream = createReadStream(filePath);
        return new StreamableFile(stream);
    }

    @Post('avatar')
    @UseGuards(AuthGuard)
    @UseInterceptors(
        LocalFilesInterceptor({
            fieldName: 'file',
            path: 'tmp',
            fileFilter: imageFileFilter,
            limits: {
                fileSize: Math.pow(2048, 2) * 10, // 20MB
            },
        })
    )
    async uploadAvatar(
        @UploadedFile() file: Express.Multer.File
    ): Promise<{ id: string; filename: string; url: string }> {
        if (!file) throw new BadRequestException('provide a valid image');
        const url = await this._userService.updateAvatar({ path: file.originalname });
        return { id: file.filename, filename: file.originalname, url };
    }
}
