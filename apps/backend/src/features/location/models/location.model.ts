import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

import { FieldInitializer } from '../../../utils/field-initializer';

export class Location extends FieldInitializer<Location> {
    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    id: number;

    @IsNotEmpty()
    @IsString()
    location: string;
}
