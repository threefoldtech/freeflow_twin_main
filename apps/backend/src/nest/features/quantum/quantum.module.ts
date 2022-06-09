import { forwardRef, Module } from '@nestjs/common';

import { FileModule } from '../file/file.module';
import { YggdrasilModule } from '../yggdrasil/yggdrasil.module';
import { QuantumController } from './quantum.controller';
import { QuantumService } from './quantum.service';

@Module({
    imports: [forwardRef(() => FileModule), forwardRef(() => YggdrasilModule)],
    controllers: [QuantumController],
    providers: [QuantumService],
    exports: [QuantumService],
})
export class QuantumModule {}
