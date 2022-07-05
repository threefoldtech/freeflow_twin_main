import { Injectable, mixin, NestInterceptor, Type } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';

import { hasSpecialCharacters } from '../../utils/special-characters';
import { uuidv4 } from '../../utils/uuid';

interface LocalFilesInterceptorOptions {
    fieldName: string;
    path?: string;
    fileFilter?: MulterOptions['fileFilter'];
    limits?: MulterOptions['limits'];
}

export function LocalFilesInterceptor(options: LocalFilesInterceptorOptions): Type<NestInterceptor> {
    @Injectable()
    class Interceptor implements NestInterceptor {
        fileInterceptor: NestInterceptor;
        constructor() {
            const destination = `${options.path}`;

            const multerOptions: MulterOptions = {
                storage: diskStorage({
                    destination,
                    filename: (_req, file, callback) => {
                        const fileName = file.originalname.split('.')[0];
                        if (hasSpecialCharacters(fileName))
                            return callback(new Error('no special characters allowed'), null);
                        return callback(null, uuidv4());
                    },
                }),
                fileFilter: options.fileFilter,
                limits: options.limits,
            };

            this.fileInterceptor = new (FileInterceptor(options.fieldName, multerOptions))();
        }

        intercept(...args: Parameters<NestInterceptor['intercept']>) {
            return this.fileInterceptor.intercept(...args);
        }
    }

    return mixin(Interceptor);
}
