import { forwardRef, Module } from '@nestjs/common';

import { EncryptionModule } from '../encryption/encryption.module';
import { FileModule } from '../file/file.module';
import { LocationModule } from '../location/location.module';
import { YggdrasilService } from './yggdrasil.service';

@Module({
    imports: [EncryptionModule, forwardRef(() => LocationModule), forwardRef(() => FileModule)],
    providers: [YggdrasilService],
    exports: [YggdrasilService],
})
export class YggdrasilModule {}
