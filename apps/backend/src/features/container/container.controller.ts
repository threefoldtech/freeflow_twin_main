import { Controller, Get } from '@nestjs/common';

@Controller('container')
export class ContainerController {
    constructor() {}

    @Get('health')
    async health(): Promise<boolean> {
        return true;
    }
}
