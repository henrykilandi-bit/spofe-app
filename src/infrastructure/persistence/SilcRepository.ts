/**
 * SilcRepository Interface 
 * Version: 1.0.0
 */

export interface SilcRepository<TEntity, TId> {
  findById(id: TId): Promise<TEntity | null>;
  save(entity: TEntity): Promise<TEntity>;
  delete(id: TId): Promise<boolean>;
  persist(entity: TEntity): Promise<TEntity>;
  query<T>(id: TId): Promise<T | null>;
}

export class InMemorySilcRepository<TEntity extends { id: TId }, TId> 
  implements SilcRepository<TEntity, TId> {
  
  private entities = new Map<TId, TEntity>();

  async findById(id: TId): Promise<TEntity | null> {
    return this.entities.get(id) || null;
  }

  async save(entity: TEntity): Promise<TEntity> {
    this.entities.set(entity.id, entity);
    return entity;
  }

  async delete(id: TId): Promise<boolean> {
    return this.entities.delete(id);
  }

  async persist(entity: TEntity): Promise<TEntity> {
    return this.save(entity);
  }

  async query<T>(id: TId): Promise<T | null> {
    return this.entities.get(id) as T || null;
  }
}