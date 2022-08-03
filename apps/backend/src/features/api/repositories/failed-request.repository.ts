import { Injectable } from '@nestjs/common';

import { DbService } from '../../db/db.service';
import { EntityRepository } from '../../db/entity.repository';
import { FailedRequestDTO } from '../dtos/failed-request.dto';
import { FailedRequest, failedRequestSchema, stringifyRequestParams } from '../models/failed-request.model';

@Injectable()
export class FailedRequestRepository extends EntityRepository<FailedRequest> {
    constructor(readonly dbService: DbService) {
        super(dbService, failedRequestSchema);
    }

    /**
     * Creates a new failed request entry in the database.
     * @param {Object} obj - The failed request object.
     * @param {AxiosRequestConfig} obj.requestParams - The request parameters.
     * @param {string} obj.location - The location (IPv6) of the failed request.
     * @param {Date} obj.lastAttempt - The last failed attempt at the request.
     */
    async createFailedRequestEntry({ requestParams, lastAttempt, location }: FailedRequestDTO) {
        return await this.save({
            lastAttempt,
            location,
            requestParams: stringifyRequestParams(requestParams),
        });
    }

    /**
     * Gets failed axios requests that have been less than 7 days.
     */
    async getFailedRequests() {
        return (await this.findAll()).filter(r => r.lastAttempt.getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000);
    }

    /**
     * Gets long awaited (7 days or more) failed axios requests.
     */
    async getLongAwaitedFailedRequests() {
        return (await this.findAll()).filter(r => r.lastAttempt.getTime() < Date.now() - 7 * 24 * 60 * 60 * 1000);
    }

    async deleteFailedRequest(id: string) {
        return await this.delete(id);
    }
}
