import { forwardRef, Module } from '@nestjs/common';
import { KeyModule } from '../key/key.module';
import { FirebaseController } from './firebase.controller';
import { FirebaseService } from './firebase.service';
import { EncryptionModule } from '../encryption/encryption.module';
import { YggdrasilModule } from '../yggdrasil/yggdrasil.module';
import { ApiModule } from '../api/api.module';

@Module({
    imports: [
        KeyModule,
        forwardRef(() => EncryptionModule),
        forwardRef(() => YggdrasilModule),
        forwardRef(() => ApiModule),
    ],
    controllers: [FirebaseController],
    providers: [FirebaseService],
    exports: [FirebaseService],
})
export class FirebaseModule {}
