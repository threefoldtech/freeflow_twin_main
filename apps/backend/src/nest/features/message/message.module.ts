import { forwardRef, Module } from '@nestjs/common';

import { ApiModule } from '../api/api.module';
import { BlockedContactModule } from '../blocked-contact/blocked-contact.module';
import { ChatModule } from '../chat/chat.module';
import { ContactModule } from '../contact/contact.module';
import { DbModule } from '../db/db.module';
import { KeyModule } from '../key/key.module';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { MessageRedisRepository } from './repositories/message-redis.repository';

@Module({
    imports: [
        DbModule,
        forwardRef(() => ChatModule),
        forwardRef(() => ContactModule),
        KeyModule,
        BlockedContactModule,
        ApiModule,
    ],
    controllers: [MessageController],
    providers: [MessageService, MessageRedisRepository],
    exports: [MessageService],
})
export class MessageModule {}
