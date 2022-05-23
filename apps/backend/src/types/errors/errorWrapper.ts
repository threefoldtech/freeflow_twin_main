import { StatusCodes } from 'http-status-codes';

export abstract class ErrorWrapper<T extends number> extends Error {
    private readonly _status: number;
    private readonly _message: string;
    private readonly _data: any;

    constructor(status: T, message?: string, data?: any) {
        super(message);
        this._status = status;
        this._message = message;
        this._data = data;
    }

    public get status() {
        return this._status;
    }

    public get message() {
        return this._message;
    }

    public get data() {
        return this._data;
    }

    public abstract getHttpStatus(): StatusCodes;
}
