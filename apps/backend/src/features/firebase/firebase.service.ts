import { Injectable } from '@nestjs/common';
import { KeyService } from '../key/key.service';
import { KeyType } from '../key/models/key.model';
import { ConfigService } from '@nestjs/config';
import { EncryptionService } from '../encryption/encryption.service';
import { PostIdentificationDto, PostNotificationDto } from './dtos/firebase.dtos';
import { ApiService } from '../api/api.service';

@Injectable()
export class FirebaseService {
    constructor(
        private readonly _keyService: KeyService,
        private readonly _configService: ConfigService,
        private readonly _encryptionService: EncryptionService,
        private readonly _apiService: ApiService
    ) {}

    async sendIdentifierToMicroService(identificationData: PostIdentificationDto) {
        const isDevelopment = this._configService.get('NODE_ENV') === 'development';
        if (isDevelopment) return;

        try {
            const userId = await this._configService.get<string>('userId');
            const sk = await this._keyService.getKey({ userId: userId, keyType: KeyType.Private });

            const header = { intention: 'identify' };

            const signedHeader = this._encryptionService.createSignature({ data: header, secretKey: sk.key });
            const encodedHeader = Buffer.from(signedHeader).toString('base64');

            console.log('Saving identifier to microservice');
            await this._apiService.saveIdentifierToExternal(identificationData, encodedHeader);
        } catch (e) {
            console.log(e);
            return;
        }
    }

    async notifyUserInMicroService(notificationData: PostNotificationDto) {
        const isDevelopment = this._configService.get('NODE_ENV') === 'development';
        if (isDevelopment) return;

        try {
            const userId = await this._configService.get<string>('userId');
            const sk = await this._keyService.getKey({ userId: userId, keyType: KeyType.Private });

            const header = { intention: 'notification' };

            const signedHeader = this._encryptionService.createSignature({ data: header, secretKey: sk.key });
            const encodedHeader = Buffer.from(signedHeader).toString('base64');

            console.log('Posting notification to firebase sync');
            await this._apiService.postNotificationToExternal(notificationData, encodedHeader);
        } catch (e) {
            console.log(e);
            return;
        }
    }
}
