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
import { createReadStream } from 'fs-extra';
import { Status, StatusUpdate } from 'types/status.type';

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
    async getStatus(): Promise<Status> {
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
    async updateContactStatus(@Body() status: StatusUpdate) {
        this._userGateway.emitMessageToConnectedClients('update_status', status);
        return true;
    }

    @Get('avatar/:avatarId')
    async getAvatar(@Param('avatarId') avatarId: string) {
        let filePath = `${this._configService.get<string>('baseDir')}user/avatar-default`;
        if (avatarId !== 'default') {
            filePath = `${this._configService.get<string>('baseDir')}user/${avatarId}`;
        }
        const stream = createReadStream(filePath);
        return new StreamableFile(stream);
    }

    @Post('avatar')
    @UseGuards(AuthGuard)
    @UseInterceptors(
        LocalFilesInterceptor({
            fieldName: 'file',
            path: 'user',
            fileFilter: imageFileFilter,
            limits: {
                fileSize: Math.pow(2048, 2), // 2MB
            },
        })
    )
    uploadAvatar(@UploadedFile() file: Express.Multer.File): Promise<string> {
        if (!file) throw new BadRequestException('provide a valid image');
        const filename = file.filename.split('.')[0];
        return this._userService.updateAvatar({ path: filename });
    }
}
