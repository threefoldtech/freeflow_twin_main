import { Injectable } from '@nestjs/common';
import { Repository } from 'redis-om';

import { DbService } from '../db/db.service';
import { Post, postSchema } from './models/post.model';

@Injectable()
export class PostService {
    private _postRepo: Repository<Post>;

    constructor(private readonly _dbService: DbService) {
        this._postRepo = this._dbService.createRepository(postSchema);
        this._postRepo.createIndex();
    }
}
