import { Controller, Delete, Get, Query } from '@nestjs/common';

import { QuantumService } from './quantum.service';

@Controller('quantum')
export class QuantumController {
    constructor(private readonly _quantumService: QuantumService) {}

    @Get('dir/content')
    async getDirectoryContent(@Query('path') path: string) {
        return await this._quantumService.getDirectoryContent({ path });
    }

    @Delete()
    async deleteFileOrDirectory(@Query('path') path: string) {
        return await this._quantumService.deleteFileOrDirectory({ path });
    }
}
