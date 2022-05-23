import { Module } from '@nestjs/common';

import { ApiModule } from '../api/api.module';
import { DbModule } from '../db/db.module';
import { EncryptionModule } from '../encryption/encryption.module';
import { KeyService } from './key.service';
import { KeyRedisRepository } from './repositories/key-redis.repository';

@Module({
    imports: [DbModule, EncryptionModule, ApiModule],
    providers: [KeyService, KeyRedisRepository],
    exports: [KeyService],
})
export class KeyModule {}
