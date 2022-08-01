import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { ApiService } from './api.service';

@Injectable()
export class ApiTasks {
    constructor(private readonly _apiService: ApiService) {}

    @Cron(CronExpression.EVERY_10_SECONDS)
    retryFailedRequests() {
        return this._apiService.retryFailedRequests();
    }

    @Cron(CronExpression.EVERY_WEEK)
    clearFailedRequests() {
        return this._apiService.clearFailedRequests();
    }
}
