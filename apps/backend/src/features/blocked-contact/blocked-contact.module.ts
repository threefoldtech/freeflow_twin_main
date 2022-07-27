import { forwardRef, Module } from '@nestjs/common';

import { DbModule } from '../db/db.module';
import { EncryptionModule } from '../encryption/encryption.module';
import { KeyModule } from '../key/key.module';
import { YggdrasilModule } from '../yggdrasil/yggdrasil.module';
import { BlockedContactController } from './blocked-contact.controller';
import { BlockedContactService } from './blocked-contact.service';
import { BlockedContactRedisRepository } from './repositories/blocked-contact-redis.repository';

@Module({
    imports: [DbModule, forwardRef(() => YggdrasilModule), KeyModule, EncryptionModule],
    controllers: [BlockedContactController],
    providers: [BlockedContactService, BlockedContactRedisRepository],
    exports: [BlockedContactService],
})
export class BlockedContactModule {}
