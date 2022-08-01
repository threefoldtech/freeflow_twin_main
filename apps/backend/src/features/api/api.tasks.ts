import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { ApiService } from './api.service';

@Injectable()
export class ApiTasks {
    constructor(private readonly _apiService: ApiService) {}

    @Cron(CronExpression.EVERY_30_MINUTES)
    retryFailedRequests() {
        return this._apiService.retryFailedRequests();
    }

    @Cron(CronExpression.EVERY_WEEK)
    clearFailedRequests() {
        return this._apiService.clearFailedRequests();
    }

    @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_NOON)
    retryLongAwaitedFailedRequests() {
        return this._apiService.retryLongAwaitedFailedRequests();
    }
}
