import { forwardRef, Module } from '@nestjs/common';

import { EncryptionModule } from '../encryption/encryption.module';
import { FileModule } from '../file/file.module';
import { LocationModule } from '../location/location.module';
import { YggdrasilService } from './yggdrasil.service';
import { UserModule } from '../user/user.module';

@Module({
    imports: [
        EncryptionModule,
        forwardRef(() => LocationModule),
        forwardRef(() => FileModule),
        forwardRef(() => UserModule),
    ],
    providers: [YggdrasilService],
    exports: [YggdrasilService],
})
export class YggdrasilModule {}
