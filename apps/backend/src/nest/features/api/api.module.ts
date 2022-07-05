import { Module } from '@nestjs/common';

import { ContactModule } from '../contact/contact.module';
import { LocationModule } from '../location/location.module';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';

@Module({
    imports: [ContactModule, LocationModule],
    providers: [ApiService],
    exports: [ApiService],
    controllers: [ApiController],
})
export class ApiModule {}
