import {
    BadRequestException,
    Body,
    Controller,
    Get,
    Post,
    Put,
    Req,
    StreamableFile,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IStatus, IStatusUpdate } from 'custom-types/status.type';
import { createReadStream } from 'fs-extra';

import { AuthGuard } from '../../guards/auth.guard';
import { imageFileFilter } from '../../utils/file-filters';
import { LocalFilesInterceptor } from '../file/file.interceptor';
import { FileService } from '../file/file.service';
import { KeyService } from '../key/key.service';
import { KeyType } from '../key/models/key.model';
import { UserGateway } from './user.gateway';
import { UserService } from './user.service';
import { Request } from 'express';
import { LocationService } from '../location/location.service';

@Controller('user')
export class UserController {
    constructor(
        private readonly _configService: ConfigService,
        private readonly _keyService: KeyService,
        private readonly _userService: UserService,
        private readonly _userGateway: UserGateway,
        private readonly _fileService: FileService,
        private readonly _locationService: LocationService
    ) {}

    @Get('containerOffline')
    async containerOffline(): Promise<boolean> {
        return false;
    }

    @Get('location')
    async getOwnLocation() {
        return await this._locationService.getOwnLocation();
    }

    @Get('publickey')
    async getPublicKey(): Promise<string> {
        const pk = await this._keyService.getKey({
            keyType: KeyType.Public,
            userId: this._configService.get<string>('userId'),
        });
        return pk.key;
    }

    @Get('me')
    async getMe(@Req() req: Request): Promise<Object> {
        return {
            username: req.session.userId,
            email: req.session.email,
        };
    }

    @Get('status')
    async getStatus(): Promise<IStatus> {
        const isOnline = (await this._userGateway.getConnections()) > 0;
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
    async updateContactStatus(@Body() status: IStatusUpdate) {
        this._userGateway.emitMessageToConnectedClients('update_status', status);
        return true;
    }

    @Get('avatar/:avatarId')
    async getAvatar() {
        // represents uuid for saving the new avatar
        let path = `${this._configService.get<string>('baseDir')}user/avatar`;
        if (!this._fileService.exists({ path })) {
            path = `${this._configService.get<string>('baseDir')}user/avatar-default`;
        }
        const stream = createReadStream(path);
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
