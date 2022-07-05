export abstract class FieldInitializer<T> {
    constructor(init?: Partial<T>) {
        Object.assign(this, init);
    }
}
