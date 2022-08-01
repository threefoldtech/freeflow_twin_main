import { Module } from '@nestjs/common';

import { ContactModule } from '../contact/contact.module';
import { DbModule } from '../db/db.module';
import { LocationModule } from '../location/location.module';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';
import { ApiTasks } from './api.tasks';
import { FailedRequestRepository } from './repositories/failed-request.repository';

@Module({
    imports: [ContactModule, LocationModule, DbModule],
    providers: [ApiService, ApiTasks, FailedRequestRepository],
    exports: [ApiService],
    controllers: [ApiController],
})
export class ApiModule {}
