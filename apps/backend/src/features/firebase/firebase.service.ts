import { Injectable } from '@nestjs/common';
import { KeyService } from '../key/key.service';
import axios from 'axios';
import { KeyType } from '../key/models/key.model';
import { ConfigService } from '@nestjs/config';
import { EncryptionService } from '../encryption/encryption.service';
import { PostIdentificationDto, PostNotificationDto } from './dtos/firebase.dtos';

@Injectable()
export class FirebaseService {
    constructor(
        private readonly _keyService: KeyService,
        private readonly _configService: ConfigService,
        private readonly _encryptionService: EncryptionService
    ) {}

    async sendIdentifierToMicroService(identificationData: PostIdentificationDto) {
        try {
            const userId = await this._configService.get<string>('userId');
            const sk = await this._keyService.getKey({ userId: userId, keyType: KeyType.Private });

            const header = { intention: 'identify' };

            const signedHeader = this._encryptionService.createSignature({ data: header, secretKey: sk.key });
            const encodedHeader = Buffer.from(signedHeader).toString('base64');

            await axios.post(
                'https://europe-west2-jimberlabs.cloudfunctions.net/api/identify',
                {
                    username: userId,
                    appId: identificationData.appId,
                    identifier: identificationData.identifier,
                },
                {
                    headers: {
                        'Jimber-Authorization': encodedHeader,
                    },
                }
            );
        } catch (e) {
            console.log(e);
            return;
        }
    }

    async notifyUserInMicroService(notificationData: PostNotificationDto) {
        try {
            const userId = await this._configService.get<string>('userId');
            const sk = await this._keyService.getKey({ userId: userId, keyType: KeyType.Private });

            const header = { intention: 'notification' };

            const signedHeader = this._encryptionService.createSignature({ data: header, secretKey: sk.key });
            const encodedHeader = Buffer.from(signedHeader).toString('base64');

            await axios.post('https://europe-west2-jimberlabs.cloudfunctions.net/api/notify', notificationData, {
                headers: {
                    'Jimber-Authorization': encodedHeader,
                },
            });
        } catch (e) {
            console.log(e);
            return;
        }
    }
}
