declare global {
    interface Array<T> {
        select<U>(cb: (x: T, i: number) => U | undefined): Array<U>;
    }
}

String.prototype.splitAndTakeLast = function (separator: string) {
    const parts = this.split(separator);
    return parts[parts.length - 1];
};

Array.prototype.select = function <T, U>(this: Array<T>, cb: (x: T, i: number) => U | undefined): Array<U> {
    return this.map(cb).filter(x => !!x);
};

export {};
