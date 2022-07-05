import { IsNotEmpty } from 'class-validator';

export class ResourceQuery {
    @IsNotEmpty()
    resource: string;
}
