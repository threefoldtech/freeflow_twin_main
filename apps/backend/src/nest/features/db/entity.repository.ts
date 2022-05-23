import { Entity, EntityCreationData, Repository, Schema } from 'redis-om';

import { DbService } from './db.service';

export abstract class EntityRepository<TEntity extends Entity> {
    private _entityRepository: Repository<TEntity>;

    constructor(protected readonly _dbService: DbService, protected readonly _entitySchema: Schema<TEntity>) {
        this._entityRepository = this._dbService.createRepository(this._entitySchema);
        this._entityRepository.createIndex();
    }

    async findAll({ offset, count }: { offset?: number; count?: number }): Promise<TEntity[]> {
        return await this._entityRepository.search().return.page(offset, count);
    }

    async findAllWhereEq({
        offset,
        count,
        where,
        eq,
    }: {
        offset?: number;
        count?: number;
        where: string;
        eq: string;
    }): Promise<TEntity[]> {
        return await this._entityRepository.search().where(where).eq(eq).return.page(offset, count);
    }

    async findOne({ where, eq }: { where: string; eq: string }): Promise<TEntity> {
        return await this._entityRepository.search().where(where).eq(eq).return.first();
    }

    async save(entity: EntityCreationData): Promise<TEntity> {
        return await this._entityRepository.createAndSave(entity);
    }

    async update(entity: EntityCreationData): Promise<TEntity> {
        return await this._entityRepository.createAndSave(entity);
    }

    async delete(entityId: string): Promise<void> {
        return await this._entityRepository.remove(entityId);
    }
}
