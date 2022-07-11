import {
    BadRequestException,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Query,
    Req,
    StreamableFile,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { createReadStream } from 'fs';
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

    @Get(':path')
    downloadFile(@Param('path') path: string): StreamableFile {
        path = atob(path);
        const filePath = join(`${this.storageDir}`, path);
        if (!path || !this._fileService.exists({ path: filePath }))
            throw new BadRequestException('please provide a valid file id');

        return new StreamableFile(createReadStream(filePath));
    }

    @Get('download/compressed')
    @UseGuards(AuthGuard)
    async downloadFilesCompressed(@Req() req: Request, @Query('path') path: string): Promise<StreamableFile> {
        try {
            const stats = await this._fileService.getStats({ path });
            if (!stats.isDirectory()) return new StreamableFile(createReadStream(path));

            const contents = this._fileService.readdirSync({ path });
            const paths = contents.map(file => join(path, '/', file));
            const zip = this._fileService.compressFiles({ paths }).toBuffer();
            if (req.res) {
                req.res.set({
                    'Content-Type': 'application/octet-stream',
                    'Content-Disposition': 'attachment; filename="files.zip"',
                    'Content-Length': zip.length.toString(),
                });
                req.res.send(zip);
            }
        } catch (error) {
            throw new BadRequestException('unable to download file(s)');
        }
    }

    @Delete()
    @UseGuards(AuthGuard)
    async deleteFileOrFolder(@Query('path') path: string): Promise<boolean> {
        try {
            const stats = await this._fileService.getStats({ path });
            if (stats.isDirectory()) return this._fileService.deleteDirectory({ path });
            return this._fileService.deleteFile({ path });
        } catch (error) {
            throw new BadRequestException(`unable to get delete file or folder: ${error}`);
        }
    }

    @Post('upload')
    @UseGuards(AuthGuard)
    @UseInterceptors(
        LocalFilesInterceptor({
            fieldName: 'file',
            path: 'tmp',
            limits: {
                fileSize: Math.pow(2048, 2) * 10, // 20MB in bytes
            },
        })
    )
    async uploadFile(@UploadedFile() file: Express.Multer.File): Promise<{ id: string; filename: string }> {
        if (!file) throw new BadRequestException('please provide a valid file');
        return { id: file.filename, filename: file.originalname };
    }
}
