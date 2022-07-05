import { FieldInitializer } from '../../../utils/field-initializer';

// DTO
export class LocationDTO extends FieldInitializer<LocationDTO> {
    id: number;
    location: string;
}
