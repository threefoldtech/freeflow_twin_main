import { Module } from '@nestjs/common';

import { EncryptionModule } from '../encryption/encryption.module';
import { KeyModule } from '../key/key.module';
import { LocationModule } from '../location/location.module';
import { YggdrasilModule } from '../yggdrasil/yggdrasil.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
    imports: [EncryptionModule, KeyModule, YggdrasilModule, LocationModule],
    providers: [AuthService],
    controllers: [AuthController],
})
export class AuthModule {}
