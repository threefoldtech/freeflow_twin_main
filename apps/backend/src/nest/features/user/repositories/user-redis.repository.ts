import { Injectable } from '@nestjs/common';

import { DbService } from '../../db/db.service';
import { EntityRepository } from '../../db/entity.repository';
import { User, userSchema } from '../models/user.model';

@Injectable()
export class UserRedisRepository extends EntityRepository<User> {
    constructor(dbService: DbService) {
        super(dbService, userSchema);
    }
}
