import { AxiosRequestConfig } from 'axios';

export class FailedRequestDTO {
    location: string;
    requestParams: AxiosRequestConfig;
    lastAttempt: Date;
}
