import { Module } from '@nestjs/common';

import { FileModule } from '../file/file.module';
import { QuantumController } from './quantum.controller';
import { QuantumService } from './quantum.service';

@Module({
    imports: [FileModule],
    controllers: [QuantumController],
    providers: [QuantumService],
})
export class QuantumModule {}
