import { Controller, Get, Query } from '@nestjs/common';

import { ApiService } from './api.service';

@Controller('external')
export class ApiController {
    constructor(private readonly _apiService: ApiService) {}

    @Get('resource')
    async getExternalResource(@Query('resource') resource: string) {
        console.log(resource);
        return await this._apiService.getExternalResource({ resource });
    }
}
