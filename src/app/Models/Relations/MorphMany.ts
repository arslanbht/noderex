import { Model } from '../Model';
import { SelectQueryBuilder } from 'typeorm';

/**
 * MorphMany relationship class
 * Represents a one-to-many polymorphic relationship
 */
export class MorphMany<T extends Model> {
  private parent: Model;
  private related: new () => T;
  private morphTypeColumn: string;
  private morphIdColumn: string;
  private localKey: string;

  constructor(
    parent: Model,
    related: new () => T,
    morphTypeColumn: string = 'morphable_type',
    morphIdColumn: string = 'morphable_id',
    localKey: string = 'id'
  ) {
    this.parent = parent;
    this.related = related;
    this.morphTypeColumn = morphTypeColumn;
    this.morphIdColumn = morphIdColumn;
    this.localKey = localKey;
  }

  /**
   * Get the parent model type
   */
  private getParentType(): string {
    return this.parent.constructor.name;
  }

  /**
   * Get query builder for the relationship
   */
  public getQuery(): SelectQueryBuilder<T> {
    const repository = (this.related as any).getRepository();
    const parentId = (this.parent as any)[this.localKey];
    const parentType = this.getParentType();

    return repository.createQueryBuilder()
      .where(`${this.morphTypeColumn} = :morphType`, { morphType: parentType })
      .andWhere(`${this.morphIdColumn} = :morphId`, { morphId: parentId });
  }

  /**
   * Get all related models
   */
  public async get(): Promise<T[]> {
    const parentId = (this.parent as any)[this.localKey];
    if (!parentId) {
      return [];
    }

    const parentType = this.getParentType();
    const RelatedModel = this.related;
    const relatedRepository = RelatedModel.getRepository();

    return await relatedRepository.find({
      where: {
        [this.morphTypeColumn]: parentType,
        [this.morphIdColumn]: parentId,
      } as any,
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

    const parentType = this.getParentType();
    const RelatedModel = this.related;
    const relatedRepository = RelatedModel.getRepository();

    return await relatedRepository.count({
      where: {
        [this.morphTypeColumn]: parentType,
        [this.morphIdColumn]: parentId,
      } as any,
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

    const parentType = this.getParentType();
    const RelatedModel = this.related;
    const instance = new RelatedModel();
    
    (instance as any)[this.morphTypeColumn] = parentType;
    (instance as any)[this.morphIdColumn] = parentId;
    
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

    const parentType = this.getParentType();

    for (const model of models) {
      (model as any)[this.morphTypeColumn] = parentType;
      (model as any)[this.morphIdColumn] = parentId;
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

    const parentType = this.getParentType();
    const RelatedModel = this.related;
    const relatedRepository = RelatedModel.getRepository();

    if (models && models.length > 0) {
      const ids = models.map(m => (m as any).id);
      await relatedRepository.delete({
        [this.morphTypeColumn]: parentType,
        [this.morphIdColumn]: parentId,
        id: { $in: ids } as any,
      } as any);
    } else {
      await relatedRepository.delete({
        [this.morphTypeColumn]: parentType,
        [this.morphIdColumn]: parentId,
      } as any);
    }
  }
}
