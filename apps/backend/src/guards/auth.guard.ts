import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { KeyService } from '../features/key/key.service';
import { KeyType } from '../features/key/models/key.model';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        @Inject(ConfigService) private readonly _configService: ConfigService,
        @Inject(KeyService) private readonly _keyService: KeyService
    ) {}

    async canActivate(context: ExecutionContext) {
        const isDevelopment = this._configService.get('NODE_ENV') === 'development';
        const userId = this._configService.get<string>('userId');

        const req = context.switchToHttp().getRequest();

        if (isDevelopment) {
            req.session.userId = userId;
            await this._keyService.updateKey({
                pk: new Uint8Array('DMnOuFVF4ODt0mys3zUagg=='.match(/.{1,2}/g).map(byte => parseInt(byte, 16))),
                keyType: KeyType.Public,
            });
            await this._keyService.updateKey({
                pk: new Uint8Array('WC+rbzPpNk2omcWeHJKChA='.match(/.{1,2}/g).map(byte => parseInt(byte, 16))),
                keyType: KeyType.Private,
            });
            return true;
        }

        const sessionUserId = req.session?.userId;
        if (!sessionUserId) return false;

        const key = await this._keyService.getKey({ keyType: KeyType.Public, userId: sessionUserId });
        if (!key || key.userId !== userId) return false;

        return sessionUserId === userId;
    }
}
