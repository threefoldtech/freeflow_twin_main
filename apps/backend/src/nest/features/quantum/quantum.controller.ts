import { Controller, Delete, Get, Query } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { QuantumService } from './quantum.service';

@Controller('quantum')
export class QuantumController {
    private storageDir = '';

    constructor(private readonly _configService: ConfigService, private readonly _quantumService: QuantumService) {
        this.storageDir = `${this._configService.get<string>('baseDir')}storage`;
    }

    @Get('dir/content')
    async getDirectoryContent(@Query('path') path: string) {
        const actualPath = path === '/' ? this.storageDir : path;
        return await this._quantumService.getDirectoryContent({ path: actualPath });
    }

    @Get('dir/info')
    async getDirectoryInfo(@Query('path') path: string) {
        return await this._quantumService.getDirectoryInfo({ path });
    }

    @Delete()
    async deleteFileOrDirectory(@Query('path') path: string) {
        return await this._quantumService.deleteFileOrDirectory({ path });
    }
}
