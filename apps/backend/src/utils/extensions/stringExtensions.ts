declare global {
    interface String {
        splitAndTakeLast(separator: string): string;
        removeAfterLastOccurrence(separator: string): string;
        insert(index: number, value: string): string;
    }
}

String.prototype.splitAndTakeLast = function (separator: string) {
    const parts = this.split(separator);
    return parts[parts.length - 1];
};

String.prototype.removeAfterLastOccurrence = function (separator: string, include = true) {
    return this.substring(0, this.lastIndexOf(separator) + (include ? 1 : 0));
};

String.prototype.insert = function (index: number, value: string) {
    if (index > 0) {
        return this.substring(0, index) + value + this.substr(index);
    }

    return value + this;
};
export {};
