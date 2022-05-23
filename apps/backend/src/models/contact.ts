import { ContactInterface } from '../types';

export default class Contact implements ContactInterface {
    id: string;
    location: string;

    constructor(id: string, location: string) {
        this.id = id;
        this.location = location;
    }
}
