import { forwardRef, Module } from '@nestjs/common';

import { ApiModule } from '../api/api.module';
import { ChatModule } from '../chat/chat.module';
import { DbModule } from '../db/db.module';
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
        MessageModule,
        KeyModule,
        ApiModule,
        ChatModule,
        DbModule,
        forwardRef(() => FileModule),
        forwardRef(() => YggdrasilModule),
        forwardRef(() => LocationModule),
    ],
    controllers: [QuantumController],
    providers: [QuantumService, ShareRedisRepository],
    exports: [QuantumService],
})
export class QuantumModule {}
