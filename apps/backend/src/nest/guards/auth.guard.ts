import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { YggdrasilService } from '../features/yggdrasil/yggdrasil.service';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        @Inject(ConfigService) private readonly _configService: ConfigService,
        @Inject(YggdrasilService) private readonly _yggdrasilService: YggdrasilService
    ) {}

    async canActivate(context: ExecutionContext) {
        // const req = context.switchToHttp().getRequest();

        // const userId = req.session?.userId;
        // const isDevMode = this._configService.get<string>('node_env') === 'development';
        // const yggdrasilInitialised = this._yggdrasilService.isInitialised();
        // if (!userId && (!isDevMode || !yggdrasilInitialised)) return false;

        // return userId === this._configService.get<string>('userId');
        return true;
    }
}
