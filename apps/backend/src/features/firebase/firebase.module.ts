import { forwardRef, Module } from '@nestjs/common';
import { KeyModule } from '../key/key.module';
import { FirebaseController } from './firebase.controller';
import { FirebaseService } from './firebase.service';
import { EncryptionModule } from '../encryption/encryption.module';
import { YggdrasilModule } from '../yggdrasil/yggdrasil.module';

@Module({
    imports: [KeyModule, forwardRef(() => EncryptionModule), forwardRef(() => YggdrasilModule)],
    controllers: [FirebaseController],
    providers: [FirebaseService],
})
export class FirebaseModule {}
