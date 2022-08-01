import { AxiosRequestConfig } from 'axios';
import { Entity, Schema } from 'redis-om';

import { FailedRequestDTO } from '../dtos/failed-request.dto';

export interface FailedRequest {
    location: string;
    requestParams: string;
    lastAttempt: Date;
}

export class FailedRequest extends Entity {
    toJSON(): FailedRequestDTO {
        return {
            location: this.location,
            requestParams: this.parseRequestParams(),
            lastAttempt: this.lastAttempt,
        };
    }

    /**
     * Parses axios request parameter string to valid JSON.
     * @return {AxiosRequestConfig} - The parsed config.
     */
    parseRequestParams(): AxiosRequestConfig {
        return JSON.parse(this.requestParams);
    }
}

export function stringifyRequestParams(params: AxiosRequestConfig) {
    return JSON.stringify(params);
}

export const failedRequestSchema = new Schema(FailedRequest, {
    location: { type: 'string' },
    requestParams: { type: 'string' },
    lastAttempt: { type: 'date' },
});
