import { forwardRef, Module } from '@nestjs/common';

import { ApiModule } from '../api/api.module';
import { ChatModule } from '../chat/chat.module';
import { ContactModule } from '../contact/contact.module';
import { DbModule } from '../db/db.module';
import { EncryptionModule } from '../encryption/encryption.module';
import { FileModule } from '../file/file.module';
import { KeyModule } from '../key/key.module';
import { LocationModule } from '../location/location.module';
import { QuantumModule } from '../quantum/quantum.module';
import { YggdrasilModule } from '../yggdrasil/yggdrasil.module';
import { UserRedisRepository } from './repositories/user-redis.repository';
import { UserController } from './user.controller';
import { UserGateway } from './user.gateway';
import { UserService } from './user.service';

@Module({
    imports: [
        DbModule,
        KeyModule,
        forwardRef(() => ApiModule),
        forwardRef(() => FileModule),
        EncryptionModule,
        forwardRef(() => LocationModule),
        forwardRef(() => YggdrasilModule),
        forwardRef(() => ChatModule),
        forwardRef(() => ContactModule),
        forwardRef(() => QuantumModule),
    ],
    controllers: [UserController],
    providers: [UserService, UserGateway, UserRedisRepository],
    exports: [UserService, UserGateway],
})
export class UserModule {}
