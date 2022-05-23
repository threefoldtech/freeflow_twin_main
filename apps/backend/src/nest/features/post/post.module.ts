import { Module } from '@nestjs/common';

import { DbModule } from '../db/db.module';
import { PostService } from './post.service';
import { PostRedisRepository } from './repositories/post-redis.repository';

@Module({
    imports: [DbModule],
    providers: [PostService, PostRedisRepository],
    exports: [PostService],
})
export class PostModule {}
