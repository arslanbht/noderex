import { Model } from '../Model';
import { SelectQueryBuilder } from 'typeorm';

/**
 * BelongsTo relationship class
 * Represents a many-to-one relationship
 */
export class BelongsTo<T extends Model> {
  private parent: Model;
  private related: new () => T;
  private foreignKey: string;
  private ownerKey: string;

  constructor(
    parent: Model,
    related: new () => T,
    foreignKey?: string,
    ownerKey: string = 'id'
  ) {
    this.parent = parent;
    this.related = related;
    this.ownerKey = ownerKey;
    this.foreignKey = foreignKey || `${this.getRelatedTableName()}_id`;
  }

  /**
   * Get the related table name
   */
  private getRelatedTableName(): string {
    const RelatedModel = this.related;
    const metadata = (RelatedModel as any).__metadata__;
    return metadata?.tableName || RelatedModel.name.toLowerCase() + 's';
  }

  /**
   * Get the related model
   */
  public async get(): Promise<T | null> {
    const foreignKeyValue = (this.parent as any)[this.foreignKey];
    if (!foreignKeyValue) {
      return null;
    }

    const RelatedModel = this.related;
    const relatedRepository = RelatedModel.getRepository();

    return await relatedRepository.findOne({
      where: { [this.ownerKey]: foreignKeyValue } as any,
    }) as T | null;
  }

  /**
   * Associate a related model
   */
  public async associate(model: T): Promise<void> {
    const ownerKeyValue = (model as any)[this.ownerKey];
    if (!ownerKeyValue) {
      throw new Error('Related model must be saved before associating');
    }

    (this.parent as any)[this.foreignKey] = ownerKeyValue;
    await this.parent.save();
  }

  /**
   * Dissociate the related model
   */
  public async dissociate(): Promise<void> {
    (this.parent as any)[this.foreignKey] = null;
    await this.parent.save();
  }
}
