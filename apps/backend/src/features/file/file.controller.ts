import {
    BadRequestException,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Query,
    Req,
    Res,
    StreamableFile,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { createReadStream } from 'fs';
import { join } from 'path';

import { AuthGuard } from '../../guards/auth.guard';
import { QuantumService } from '../quantum/quantum.service';
import { LocalFilesInterceptor } from './file.interceptor';
import { FileService } from './file.service';

@Controller('files')
export class FileController {
    private storageDir = '';

    constructor(
        private readonly _configService: ConfigService,
        private readonly _fileService: FileService,
        private readonly _quantumService: QuantumService
    ) {
        this.storageDir = `${this._configService.get<string>('baseDir')}storage`;
    }

    @Get(':path')
    async downloadFile(@Req() req: Request, @Res() res: Response, @Param('path') path: string) {
        path = Buffer.from(path, 'base64').toString('binary');
        const filePath = join(`${this.storageDir}`, path);
        if (!path || !this._fileService.exists({ path: filePath }))
            throw new BadRequestException('please provide a valid file id');

        if (path.endsWith('.wav')) {
            req.res.setHeader(`content-type`, `audio/wav`);
            req.res.setHeader(`content-transfer-encoding`, 'binary');
            req.res.setHeader(`Accept-Ranges`, 'bytes');
        }

        const fileBuffer = this._fileService.readFile({ path: filePath });
        const fileStream = await this._fileService.getFileStream({ file: fileBuffer });
        const fileInfo = await this._quantumService.getFileInfo({ path: filePath });

        if (req.res) req.res.setHeader(`Content-Disposition`, `attachment; filename=${fileInfo.fullName}`);

        fileStream.pipe(req.res);

        await new Promise(resolve => {
            fileStream.on('end', () => {
                resolve(req.res.end());
            });
        });
    }

    @Get('download/compressed')
    @UseGuards(AuthGuard)
    async downloadFilesCompressed(@Req() req: Request, @Query('path') path: string): Promise<StreamableFile> {
        path = Buffer.from(path, 'base64').toString('binary');
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
                fileSize: Math.pow(1024, 2) * 10000, // 10GB in bytes
            },
        })
    )
    async uploadFile(
        @UploadedFile() file: Express.Multer.File
    ): Promise<{ id: string; filename: string; filetype: string }> {
        if (!file) throw new BadRequestException('please provide a valid file');
        return { id: file.filename, filename: file.originalname, filetype: file.mimetype };
    }
}
