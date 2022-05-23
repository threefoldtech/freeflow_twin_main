import { Module } from '@nestjs/common';

import { DbModule } from '../db/db.module';
import { PostService } from './post.service';

@Module({
    imports: [DbModule],
    providers: [PostService],
    exports: [PostService],
})
export class PostModule {}
