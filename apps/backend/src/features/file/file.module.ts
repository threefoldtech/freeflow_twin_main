import { forwardRef, Module } from '@nestjs/common';

import { ApiModule } from '../api/api.module';
import { ChatModule } from '../chat/chat.module';
import { EncryptionModule } from '../encryption/encryption.module';
import { KeyModule } from '../key/key.module';
import { LocationModule } from '../location/location.module';
import { MessageModule } from '../message/message.module';
import { QuantumModule } from '../quantum/quantum.module';
import { YggdrasilModule } from '../yggdrasil/yggdrasil.module';
import { FileController } from './file.controller';
import { FileGateway } from './file.gateway';
import { FileService } from './file.service';
import { FileTasks } from './file.tasks';

@Module({
    imports: [
        forwardRef(() => YggdrasilModule),
        forwardRef(() => ApiModule),
        forwardRef(() => LocationModule),
        KeyModule,
        ChatModule,
        MessageModule,
        EncryptionModule,
        forwardRef(() => QuantumModule),
    ],
    controllers: [FileController],
    providers: [FileService, FileTasks, FileGateway],
    exports: [FileService, FileGateway],
})
export class FileModule {}
