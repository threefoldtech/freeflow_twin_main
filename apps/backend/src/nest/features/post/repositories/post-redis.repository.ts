import { Injectable } from '@nestjs/common';

import { DbService } from '../../db/db.service';
import { EntityRepository } from '../../db/entity.repository';
import { Post, postSchema } from '../models/post.model';

@Injectable()
export class PostRedisRepository extends EntityRepository<Post> {
    constructor(readonly dbService: DbService) {
        super(dbService, postSchema);
    }
}
