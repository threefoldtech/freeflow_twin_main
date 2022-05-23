import { Module } from '@nestjs/common';

import { ApiModule } from '../api/api.module';
import { EncryptionModule } from '../encryption/encryption.module';
import { LocationController } from './location.controller';
import { LocationService } from './location.service';

@Module({
    imports: [EncryptionModule, ApiModule],
    providers: [LocationService],
    controllers: [LocationController],
    exports: [LocationService],
})
export class LocationModule {}
