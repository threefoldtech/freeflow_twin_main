import { Body, Controller, Post, UseGuards } from '@nestjs/common';

import { KeyService } from '../key/key.service';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '../../guards/auth.guard';
import { FirebaseService } from './firebase.service';
import { PostIdentificationDto } from './dtos/firebase.dtos';
import { PostNotificationDto } from './dtos/firebase.dtos';

@Controller('firebase')
export class FirebaseController {
    constructor(
        private readonly _keyService: KeyService,
        private readonly _configService: ConfigService,
        private readonly _firebaseService: FirebaseService
    ) {}

    @UseGuards(AuthGuard)
    @Post('identify')
    async postIdentifier(@Body() identificationData: PostIdentificationDto): Promise<void> {
        return await this._firebaseService.sendIdentifierToMicroService(identificationData);
    }

    @UseGuards(AuthGuard)
    @Post('notify')
    async notifyUser(@Body() notificationData: PostNotificationDto): Promise<void> {
        return await this._firebaseService.notifyUserInMicroService(notificationData);
    }
}
