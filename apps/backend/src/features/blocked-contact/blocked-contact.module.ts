import { forwardRef, Module } from '@nestjs/common';

import { DbModule } from '../db/db.module';
import { EncryptionModule } from '../encryption/encryption.module';
import { KeyModule } from '../key/key.module';
import { YggdrasilModule } from '../yggdrasil/yggdrasil.module';
import { BlockedContactController } from './blocked-contact.controller';
import { BlockedContactService } from './blocked-contact.service';
import { BlockedContactRedisRepository } from './repositories/blocked-contact-redis.repository';
import { ApiModule } from '../api/api.module';
import { ContactModule } from '../contact/contact.module';
import { MessageModule } from '../message/message.module';
import { ChatRedisRepository } from '../chat/repositories/chat-redis.repository';

@Module({
    imports: [
        DbModule,
        forwardRef(() => YggdrasilModule),
        forwardRef(() => ApiModule),
        forwardRef(() => ContactModule),
        forwardRef(() => MessageModule),
        KeyModule,
        EncryptionModule,
    ],
    controllers: [BlockedContactController],
    providers: [BlockedContactService, BlockedContactRedisRepository, ChatRedisRepository],
    exports: [BlockedContactService],
})
export class BlockedContactModule {}
