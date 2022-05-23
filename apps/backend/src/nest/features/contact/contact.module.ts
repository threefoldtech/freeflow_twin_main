import { forwardRef, Module } from '@nestjs/common';

import { ApiModule } from '../api/api.module';
import { ChatModule } from '../chat/chat.module';
import { DbModule } from '../db/db.module';
import { KeyModule } from '../key/key.module';
import { LocationModule } from '../location/location.module';
import { MessageModule } from '../message/message.module';
import { YggdrasilModule } from '../yggdrasil/yggdrasil.module';
import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';
import { ContactRedisRepository } from './repositories/contact-redis.repository';

@Module({
    imports: [
        DbModule,
        KeyModule,
        ApiModule,
        forwardRef(() => LocationModule),
        forwardRef(() => YggdrasilModule),
        forwardRef(() => ChatModule),
        forwardRef(() => MessageModule),
    ],
    controllers: [ContactController],
    providers: [ContactService, ContactRedisRepository],
    exports: [ContactService],
})
export class ContactModule {}
