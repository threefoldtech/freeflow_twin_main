import { Body, Controller, Get, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

import { AuthGuard } from '../../guards/auth.guard';
import { CreateDirectoryDTO } from '../file/dtos/directory.dto';
import { DirectoryInfoDTO } from '../file/dtos/directory-info.dto';
import { PathInfoDTO } from '../file/dtos/path-info.dto';
import { MoveFileDTO } from './dtos/move-file.dto';
import { RenameFileDTO } from './dtos/rename-file.dto';
import { ShareFileRequesDTO } from './dtos/share-file.dto';
import { IFileShare } from './interfaces/file-share.interface';
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

    @Get('file/info')
    @UseGuards(AuthGuard)
    async getFileInfo() {
        // TODO: continue here
    }

    @Get('search')
    @UseGuards(AuthGuard)
    async search(@Query('search') search: string, @Query('dir') dir: string): Promise<PathInfoDTO[]> {
        const path = dir === '/' ? this.storageDir : dir;
        return await this._quantumService.search({ search, dir: path });
    }

    @Get('shares/shared-with-me')
    @UseGuards(AuthGuard)
    async getSharedWithMe(): Promise<IFileShare[]> {
        return await this._quantumService.getSharedWithMe();
    }

    @Get('share')
    @UseGuards(AuthGuard)
    async getShareById(@Query('id') id: string): Promise<IFileShare> {
        return (await this._quantumService.getShareById({ id })).toJSON();
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

    @Post('share')
    @UseGuards(AuthGuard)
    async shareFile(@Body() shareFileDTO: ShareFileRequesDTO) {
        return await this._quantumService.shareFile(shareFileDTO);
    }

    @Put('rename')
    @UseGuards(AuthGuard)
    async renameFileOrDirectory(@Body() { from, to }: RenameFileDTO): Promise<void> {
        const actualPath = to.includes('appdata') ? to : join(this.storageDir, to);
        return await this._quantumService.renameFileOrDirectory({ from, to: actualPath });
    }
}
