import {
    BadRequestException,
    Controller,
    Get,
    Param,
    Post,
    StreamableFile,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createReadStream } from 'fs-extra';
import { join } from 'path';

import { AuthGuard } from '../../guards/auth.guard';
import { LocalFilesInterceptor } from './file.interceptor';
import { FileService } from './file.service';

@Controller('files')
export class FileController {
    private storageDir = '';

    constructor(private readonly _configService: ConfigService, private readonly _fileService: FileService) {
        this.storageDir = `${this._configService.get<string>('baseDir')}storage`;
    }

    @Get(':fileId')
    downloadFile(@Param('fileId') fileId: string): StreamableFile {
        const path = join(this.storageDir, fileId);
        if (!fileId || !this._fileService.fileExists({ path }))
            throw new BadRequestException('please provide a valid file id');

        return new StreamableFile(createReadStream(path));
    }

    @Post('upload')
    @UseGuards(AuthGuard)
    @UseInterceptors(
        LocalFilesInterceptor({
            fieldName: 'file',
            path: 'tmp',
            limits: {
                fileSize: Math.pow(2048, 20), // 20MB in bytes
            },
        })
    )
    async uploadFile(@UploadedFile() file: Express.Multer.File) {
        if (!file) throw new BadRequestException('please provide a valid file');
        return { id: file.filename, filename: file.originalname };
    }
}
