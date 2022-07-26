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
        // const req = context.switchToHttp().getRequest();
        // const sessionUserId = req.session?.userId;
        // if (!sessionUserId) return false;
        // const key = await this._keyService.getKey({ keyType: KeyType.Public, userId: sessionUserId });
        // const userId = this._configService.get<string>('userId');
        // if (!key || key.userId !== userId) return false;
        // return sessionUserId === userId;
        return true;
    }
}
