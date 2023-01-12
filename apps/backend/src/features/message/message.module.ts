import { forwardRef, Module } from '@nestjs/common';

import { ApiModule } from '../api/api.module';
import { BlockedContactModule } from '../blocked-contact/blocked-contact.module';
import { ChatModule } from '../chat/chat.module';
import { ContactModule } from '../contact/contact.module';
import { DbModule } from '../db/db.module';
import { KeyModule } from '../key/key.module';
import { QuantumModule } from '../quantum/quantum.module';
import { YggdrasilModule } from '../yggdrasil/yggdrasil.module';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { MessageRedisRepository } from './repositories/message-redis.repository';
import { UserModule } from '../user/user.module';
import { FirebaseModule } from '../firebase/firebase.module';

@Module({
    imports: [
        DbModule,
        forwardRef(() => ChatModule),
        forwardRef(() => ContactModule),
        forwardRef(() => YggdrasilModule),
        forwardRef(() => QuantumModule),
        forwardRef(() => BlockedContactModule),
        forwardRef(() => ApiModule),
        forwardRef(() => UserModule),
        forwardRef(() => FirebaseModule),
        KeyModule,
    ],
    controllers: [MessageController],
    providers: [MessageService, MessageRedisRepository],
    exports: [MessageService],
})
export class MessageModule {}
