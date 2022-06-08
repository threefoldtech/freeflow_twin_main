import { Module } from '@nestjs/common';

import { FileModule } from '../file/file.module';
import { YggdrasilModule } from '../yggdrasil/yggdrasil.module';
import { QuantumController } from './quantum.controller';
import { QuantumService } from './quantum.service';

@Module({
    imports: [FileModule, YggdrasilModule],
    controllers: [QuantumController],
    providers: [QuantumService],
})
export class QuantumModule {}
