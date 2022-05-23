import { forwardRef, Module } from '@nestjs/common';

import { ApiModule } from '../api/api.module';
import { ChatModule } from '../chat/chat.module';
import { KeyModule } from '../key/key.module';
import { LocationModule } from '../location/location.module';
import { YggdrasilModule } from '../yggdrasil/yggdrasil.module';
import { FileController } from './file.controller';
import { FileGateway } from './file.gateway';
import { FileService } from './file.service';
import { FileSchedulingService } from './file-scheduling.service';

@Module({
    imports: [forwardRef(() => YggdrasilModule), ApiModule, LocationModule, KeyModule, ChatModule],
    controllers: [FileController],
    providers: [FileService, FileSchedulingService, FileGateway],
    exports: [FileService, FileGateway],
})
export class FileModule {}
