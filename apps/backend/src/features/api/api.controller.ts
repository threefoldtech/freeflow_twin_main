import { BadRequestException, Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import http from 'http';

import { ContactService } from '../contact/contact.service';
import { LocationService } from '../location/location.service';
import { ApiService } from './api.service';

@Controller('external')
export class ApiController {
    constructor(
        private readonly _contactService: ContactService,
        private readonly _locationService: LocationService,
        private readonly _apiService: ApiService
    ) {}

    @Get('preview')
    async getUrlPreview(@Query('url') url: string) {
        return await this._apiService.getUrlPreview({ url });
    }

    @Get('resource')
    async getExternalResource(@Res() res: Response, @Query('loc') loc: string) {
        if (!loc) throw new BadRequestException('missing resource location');

        const openIdx = loc.indexOf('[');
        const closingIdx = loc.indexOf(']');
        const ipv6 = loc.substring(openIdx + 1, closingIdx);
        if (!ipv6) return;
        if (openIdx === -1 || closingIdx === -1) throw new BadRequestException('invalid resource location');

        // const ownLocation = await this._locationService.getOwnLocation();

        // if (ownLocation !== ipv6) {
        //     const contact = await this._contactService.getContactByLocation({ location: ipv6 });
        //     if (!contact) return;
        // }

        http.get(loc, response => {
            const length = response.rawHeaders.length;
            let index = 0;
            while (index < length) {
                res.setHeader(response.rawHeaders[index], response.rawHeaders[index + 1]);
                index += 2;
            }
            response.pipe(res);
        }).on('error', () => {
            return;
        });
    }
}
