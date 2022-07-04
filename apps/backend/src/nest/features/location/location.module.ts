import { forwardRef, Module } from '@nestjs/common';

import { ApiModule } from '../api/api.module';
import { EncryptionModule } from '../encryption/encryption.module';
import { YggdrasilModule } from '../yggdrasil/yggdrasil.module';
import { LocationController } from './location.controller';
import { LocationService } from './location.service';

@Module({
    imports: [EncryptionModule, forwardRef(() => ApiModule), forwardRef(() => YggdrasilModule)],
    providers: [LocationService],
    controllers: [LocationController],
    exports: [LocationService],
})
export class LocationModule {}
