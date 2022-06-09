import { Body, Controller, Delete, Get, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

import { AuthGuard } from '../../guards/auth.guard';
import { CreateDirectoryDTO } from '../file/dtos/directory.dto';
import { DirectoryInfoDTO } from '../file/dtos/directory-info.dto';
import { PathInfoDTO } from '../file/dtos/path-info.dto';
import { MoveFileDTO } from './dtos/move-file.dto';
import { RenameFileDTO } from './dtos/rename-file.dto';
import { QuantumService } from './quantum.service';

@Controller('quantum')
export class QuantumController {
    private storageDir = '';

    constructor(private readonly _configService: ConfigService, private readonly _quantumService: QuantumService) {
        this.storageDir = `${this._configService.get<string>('baseDir')}storage`;
    }

    @Get('dir/content')
    @UseGuards(AuthGuard)
    async getDirectoryContent(@Query('path') path: string): Promise<PathInfoDTO[]> {
        const actualPath = path === '/' ? this.storageDir : path;
        return await this._quantumService.getDirectoryContent({ path: actualPath });
    }

    @Get('dir/info')
    @UseGuards(AuthGuard)
    async getDirectoryInfo(@Query('path') path: string): Promise<PathInfoDTO> {
        const actualPath = path === '/' ? this.storageDir : path;
        return await this._quantumService.getDirectoryInfo({ path: actualPath });
    }

    @Post('dir')
    @UseGuards(AuthGuard)
    async createDirectory(@Body() { path, name }: CreateDirectoryDTO): Promise<DirectoryInfoDTO> {
        const actualPath = path === '/' ? join(this.storageDir, name) : join(path, name);
        const details = await this._quantumService.createDirectoryWithRetry({ path: actualPath });
        return {
            isFile: false,
            name: details.name,
            isDirectory: true,
        } as DirectoryInfoDTO;
    }

    @Post('move-files')
    @UseGuards(AuthGuard)
    moveFiles(@Body() { paths, destination }: MoveFileDTO): boolean {
        paths.map(path => {
            this._quantumService.createFileWithRetry({
                fromPath: path,
                toPath: destination,
                name: path.split('/').pop(),
            });
        });
        return true;
    }

    @Put('rename')
    @UseGuards(AuthGuard)
    async renameFileOrDirectory(@Body() { from, to }: RenameFileDTO): Promise<void> {
        return await this._quantumService.renameFileOrDirectory({ from, to: join(this.storageDir, to) });
    }

    @Delete()
    async deleteFileOrDirectory(@Query('path') path: string): Promise<boolean> {
        return await this._quantumService.deleteFileOrDirectory({ path });
    }
}
