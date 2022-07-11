import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { KeyService } from '../features/key/key.service';
import { KeyType } from '../features/key/models/key.model';
import { YggdrasilService } from '../features/yggdrasil/yggdrasil.service';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        @Inject(ConfigService) private readonly _configService: ConfigService,
        @Inject(YggdrasilService) private readonly _yggdrasilService: YggdrasilService,
        @Inject(KeyService) private readonly _keyService: KeyService
    ) {}

    async canActivate(context: ExecutionContext) {
        const req = context.switchToHttp().getRequest();

        const userId = req.session?.userId;
        const isDevMode = this._configService.get<string>('node_env') === 'development';
        const yggdrasilInitialised = this._yggdrasilService.isInitialised();
        if (!userId && (!isDevMode || !yggdrasilInitialised)) return false;

        const key = await this._keyService.getKey({ keyType: KeyType.Public, userId });
        if (!key) return false;

        return userId === this._configService.get<string>('userId');
    }
}
