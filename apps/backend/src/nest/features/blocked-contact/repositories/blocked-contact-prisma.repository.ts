import { Injectable } from '@nestjs/common';

import { CreateBlockedContactDTO, DeleteBlockedContactDTO } from '../dtos/blocked-contact.dto';
import { BlockedContactRepository } from '../types/blocked-contact.repository';

@Injectable()
export class BlockedContactPrismaRepository implements BlockedContactRepository {
    getBlockedContacts(): Promise<string[]> {
        throw new Error('Method not implemented.');
    }
    addBlockedContact({ id }: CreateBlockedContactDTO): Promise<string> {
        throw new Error('Method not implemented.');
    }
    deleteBlockedContact({ id }: DeleteBlockedContactDTO): Promise<void> {
        throw new Error('Method not implemented.');
    }
}
