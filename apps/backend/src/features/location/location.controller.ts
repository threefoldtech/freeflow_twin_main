import { Controller, Get } from '@nestjs/common';

import { LocationService } from './location.service';
import { LocationResponse } from './types/responses';

@Controller('locations')
export class LocationController {
    constructor(private readonly _locationService: LocationService) {}

    @Get()
    getLocations(): LocationResponse {
        return this._locationService.getLocations();
    }

    @Get('yggdrasil')
    async getYggdrasilAddress() {
        return await this._locationService.getOwnLocation();
    }
}
