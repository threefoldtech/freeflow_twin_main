import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

import config from '../../config/config';
import { LoggerMiddleware } from '../../middleware/logger.middleware';
import { ApiModule } from '../api/api.module';
import { AuthModule } from '../auth/auth.module';
import { BlockedContactModule } from '../blocked-contact/blocked-contact.module';
import { ChatModule } from '../chat/chat.module';
import { ContactModule } from '../contact/contact.module';
import { DbModule } from '../db/db.module';
import { EncryptionModule } from '../encryption/encryption.module';
import { FileModule } from '../file/file.module';
import { KeyModule } from '../key/key.module';
import { LocationModule } from '../location/location.module';
import { MessageModule } from '../message/message.module';
import { PostModule } from '../post/post.module';
import { UserModule } from '../user/user.module';
import { YggdrasilModule } from '../yggdrasil/yggdrasil.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            // validationSchema: Joi.object({
            //     PORT: Joi.number().required(),
            //     NODE_ENV: Joi.string().required(),
            //     BASE_DIR: Joi.string().required(),
            //     UPLOAD_DESTINATION: Joi.string().required(),
            //     DIGITALTWIN_APPID: Joi.string().required(),
            //     USER_ID: Joi.string().required(),
            //     SEED_PHRASE: Joi.string().required(),
            //     SESSION_SECRET: Joi.string().required(),
            // }),
            load: [config],
            isGlobal: true,
            cache: true,
        }),
        ScheduleModule.forRoot(),
        DbModule,
        ApiModule,
        AuthModule,
        EncryptionModule,
        FileModule,
        YggdrasilModule,
        LocationModule,
        KeyModule,
        UserModule,
        ChatModule,
        ContactModule,
        BlockedContactModule,
        MessageModule,
        PostModule,
    ],
})
export class AppModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(LoggerMiddleware).forRoutes('*');
    }
}
