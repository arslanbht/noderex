import { Model } from '../Model';
import { SelectQueryBuilder, ObjectLiteral } from 'typeorm';

/**
 * HasMany relationship class
 * Represents a one-to-many relationship
 */
export class HasMany<T extends Model> {
  private parent: Model;
  private related: new () => T;
  private foreignKey: string;
  private localKey: string;

  constructor(
    parent: Model,
    related: new () => T,
    foreignKey?: string,
    localKey: string = 'id'
  ) {
    this.parent = parent;
    this.related = related;
    this.localKey = localKey;
    this.foreignKey = foreignKey || `${this.getParentTableName()}_id`;
  }

  /**
   * Get the parent table name
   */
  private getParentTableName(): string {
    const metadata = (this.parent.constructor as any).__metadata__;
    return metadata?.tableName || this.parent.constructor.name.toLowerCase() + 's';
  }

  /**
   * Get query builder for the relationship
   */
  public getQuery(): SelectQueryBuilder<T> {
    const repository = (this.parent.constructor as any).getRepository();
    return repository.createQueryBuilder()
      .where(`${this.foreignKey} = :parentId`, { parentId: (this.parent as any)[this.localKey] });
  }

  /**
   * Get all related models
   */
  public async get(): Promise<T[]> {
    const parentId = (this.parent as any)[this.localKey];
    if (!parentId) {
      return [];
    }

    const repository = (this.parent.constructor as any).getRepository();
    const RelatedModel = this.related;
    const relatedRepository = RelatedModel.getRepository();

    return await relatedRepository.find({
      where: { [this.foreignKey]: parentId } as any,
    });
  }

  /**
   * Get count of related models
   */
  public async count(): Promise<number> {
    const parentId = (this.parent as any)[this.localKey];
    if (!parentId) {
      return 0;
    }

    const RelatedModel = this.related;
    const relatedRepository = RelatedModel.getRepository();

    return await relatedRepository.count({
      where: { [this.foreignKey]: parentId } as any,
    });
  }

  /**
   * Create a new related model
   */
  public async create(attributes: Partial<T>): Promise<T> {
    const parentId = (this.parent as any)[this.localKey];
    if (!parentId) {
      throw new Error('Parent model must be saved before creating related model');
    }

    const RelatedModel = this.related;
    const instance = new RelatedModel();
    (instance as any)[this.foreignKey] = parentId;
    Object.assign(instance, attributes);
    return await instance.save() as T;
  }

  /**
   * Attach related models
   */
  public async attach(models: T[]): Promise<void> {
    const parentId = (this.parent as any)[this.localKey];
    if (!parentId) {
      throw new Error('Parent model must be saved before attaching related models');
    }

    for (const model of models) {
      (model as any)[this.foreignKey] = parentId;
      await model.save();
    }
  }

  /**
   * Detach related models
   */
  public async detach(models?: T[]): Promise<void> {
    const parentId = (this.parent as any)[this.localKey];
    if (!parentId) {
      return;
    }

    const RelatedModel = this.related;
    const relatedRepository = RelatedModel.getRepository();

    if (models && models.length > 0) {
      const ids = models.map(m => (m as any).id);
      await relatedRepository.delete({ [this.foreignKey]: parentId, id: { $in: ids } } as any);
    } else {
      await relatedRepository.delete({ [this.foreignKey]: parentId } as any);
    }
  }
}
