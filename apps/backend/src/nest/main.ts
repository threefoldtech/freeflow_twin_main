import { ClassSerializerInterceptor, INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import session from 'express-session';

import { AppModule } from './features/app/app.module';
import getLogLevels from './utils/get-log-levels';

/**
 * Bootstrap creates and returns a NestJS application.
 * @return {INestApplication} The NestJS application.
 */
export default async function bootstrap(): Promise<INestApplication> {
    const app = await NestFactory.create(AppModule);

    // CORS
    app.enableCors({ origin: '*' });

    // init config service
    const configService = app.get<ConfigService>(ConfigService);

    // logger middleware depending on node environment
    app.useLogger(getLogLevels(configService.get<string>('node_env') === 'production'));

    // global validation pipe for class-validator
    app.useGlobalPipes(new ValidationPipe());

    // global class serialization for class-transformer
    app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

    // sessions
    app.use(
        session({
            name: 'sessionId',
            secret: configService.get<string>('sessionSecret'),
            resave: false,
            saveUninitialized: false,
            proxy: true,
            cookie: {
                path: '/',
                httpOnly: false,
                secure: false,
            },
        })
    );

    return app;
}
