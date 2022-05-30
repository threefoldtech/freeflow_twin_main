import { Module } from '@nestjs/common';

import { DbModule } from '../db/db.module';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { PostRedisRepository } from './repositories/post-redis.repository';

@Module({
    imports: [DbModule],
    controllers: [PostController],
    providers: [PostService, PostRedisRepository],
    exports: [PostService],
})
export class PostModule {}
