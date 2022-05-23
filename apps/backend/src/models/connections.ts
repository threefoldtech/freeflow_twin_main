export default class Connections {
    socketIds: string[];
    constructor(connections: Array<string>) {
        this.socketIds = connections;
    }

    add(connection: string) {
        this.socketIds.push(connection);
    }

    delete(connection: string) {
        const index = this.socketIds.findIndex(c => c === connection);
        this.socketIds.splice(index, 1);
    }

    getConnections() {
        return this.socketIds;
    }
}
