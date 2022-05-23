import { DtIdInterface, IdInterface, MessageBodyTypeInterface, MessageInterface, MessageTypes } from '../types';

export default class Message<T> implements MessageInterface<T> {
    public from: DtIdInterface;
    public to: IdInterface;
    public body: T;
    public timeStamp: Date;
    public id: IdInterface;
    public type: MessageTypes;
    public replies: MessageInterface<MessageBodyTypeInterface>[];
    public subject: IdInterface | null;
    public signatures: string[];
    public updated?: Date;

    constructor(
        from: DtIdInterface,
        to: IdInterface,
        body: T,
        timeStamp: Date,
        id: IdInterface,
        type: MessageTypes,
        replies: MessageInterface<MessageBodyTypeInterface>[],
        subject: IdInterface | null,
        signatures: string[] | undefined,
        updated: Date = undefined
    ) {
        this.from = from;
        this.to = to;
        this.body = body;
        this.timeStamp = timeStamp;
        this.id = id;
        this.type = type;
        this.replies = replies;
        this.subject = subject;
        this.signatures = signatures ?? [];
        this.updated = updated;
    }
}
