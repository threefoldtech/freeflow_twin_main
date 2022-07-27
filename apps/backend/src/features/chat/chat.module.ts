import { forwardRef, Module } from '@nestjs/common';

import { ApiModule } from '../api/api.module';
import { BlockedContactModule } from '../blocked-contact/blocked-contact.module';
import { ContactModule } from '../contact/contact.module';
import { DbModule } from '../db/db.module';
import { EncryptionModule } from '../encryption/encryption.module';
import { KeyModule } from '../key/key.module';
import { LocationModule } from '../location/location.module';
import { MessageModule } from '../message/message.module';
import { YggdrasilModule } from '../yggdrasil/yggdrasil.module';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { ChatRedisRepository } from './repositories/chat-redis.repository';

@Module({
    imports: [
        DbModule,
        KeyModule,
        EncryptionModule,
        forwardRef(() => BlockedContactModule),
        forwardRef(() => ApiModule),
        forwardRef(() => LocationModule),
        forwardRef(() => YggdrasilModule),
        forwardRef(() => MessageModule),
        forwardRef(() => ContactModule),
    ],
    controllers: [ChatController],
    providers: [ChatService, ChatGateway, ChatRedisRepository],
    exports: [ChatService, ChatGateway],
})
export class ChatModule {}
