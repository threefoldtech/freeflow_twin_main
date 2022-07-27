import { forwardRef, Module } from '@nestjs/common';

import { ApiModule } from '../api/api.module';
import { ChatModule } from '../chat/chat.module';
import { ContactModule } from '../contact/contact.module';
import { DbModule } from '../db/db.module';
import { EncryptionModule } from '../encryption/encryption.module';
import { FileModule } from '../file/file.module';
import { KeyModule } from '../key/key.module';
import { LocationModule } from '../location/location.module';
import { MessageModule } from '../message/message.module';
import { YggdrasilModule } from '../yggdrasil/yggdrasil.module';
import { QuantumController } from './quantum.controller';
import { QuantumService } from './quantum.service';
import { ShareRedisRepository } from './repositories/share-redis.repository';

@Module({
    imports: [
        KeyModule,
        DbModule,
        EncryptionModule,
        forwardRef(() => ContactModule),
        forwardRef(() => ApiModule),
        forwardRef(() => FileModule),
        forwardRef(() => ChatModule),
        forwardRef(() => MessageModule),
        forwardRef(() => YggdrasilModule),
        forwardRef(() => LocationModule),
    ],
    controllers: [QuantumController],
    providers: [QuantumService, ShareRedisRepository],
    exports: [QuantumService],
})
export class QuantumModule {}
