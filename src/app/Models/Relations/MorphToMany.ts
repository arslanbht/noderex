import { Model } from '../Model';
import { SelectQueryBuilder } from 'typeorm';

/**
 * MorphToMany relationship class
 * Represents a many-to-many polymorphic relationship
 */
export class MorphToMany<T extends Model> {
  private parent: Model;
  private related: new () => T;
  private pivotTable: string;
  private foreignPivotKey: string;
  private relatedPivotKey: string;
  private morphTypeColumn: string;
  private morphIdColumn: string;
  private parentKey: string;
  private relatedKey: string;

  constructor(
    parent: Model,
    related: new () => T,
    pivotTable: string,
    morphTypeColumn: string = 'morphable_type',
    morphIdColumn: string = 'morphable_id',
    foreignPivotKey?: string,
    relatedPivotKey?: string,
    parentKey: string = 'id',
    relatedKey: string = 'id'
  ) {
    this.parent = parent;
    this.related = related;
    this.pivotTable = pivotTable;
    this.parentKey = parentKey;
    this.relatedKey = relatedKey;
    this.morphTypeColumn = morphTypeColumn;
    this.morphIdColumn = morphIdColumn;
    this.foreignPivotKey = foreignPivotKey || `${this.getParentTableName()}_id`;
    this.relatedPivotKey = relatedPivotKey || `${this.getRelatedTableName()}_id`;
  }

  /**
   * Get the parent table name
   */
  private getParentTableName(): string {
    const metadata = (this.parent.constructor as any).__metadata__;
    return metadata?.tableName || this.parent.constructor.name.toLowerCase() + 's';
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
   * Get the parent model type
   */
  private getParentType(): string {
    return this.parent.constructor.name;
  }

  /**
   * Get all related models
   */
  public async get(): Promise<T[]> {
    const parentId = (this.parent as any)[this.parentKey];
    if (!parentId) {
      return [];
    }

    const parentType = this.getParentType();
    const RelatedModel = this.related;
    const relatedRepository = RelatedModel.getRepository();
    const relatedTableName = this.getRelatedTableName();

    const query = `
      SELECT ${relatedTableName}.* 
      FROM ${relatedTableName}
      INNER JOIN ${this.pivotTable} 
        ON ${relatedTableName}.${this.relatedKey} = ${this.pivotTable}.${this.relatedPivotKey}
      WHERE ${this.pivotTable}.${this.foreignPivotKey} = ?
        AND ${this.pivotTable}.${this.morphTypeColumn} = ?
    `;

    const results = await relatedRepository.query(query, [parentId, parentType]);
    return results.map((row: any) => {
      const instance = new RelatedModel();
      Object.assign(instance, row);
      return instance;
    });
  }

  /**
   * Get count of related models
   */
  public async count(): Promise<number> {
    const parentId = (this.parent as any)[this.parentKey];
    if (!parentId) {
      return 0;
    }

    const parentType = this.getParentType();
    const RelatedModel = this.related;
    const relatedRepository = RelatedModel.getRepository();
    const relatedTableName = this.getRelatedTableName();

    const query = `
      SELECT COUNT(*) as count
      FROM ${relatedTableName}
      INNER JOIN ${this.pivotTable} 
        ON ${relatedTableName}.${this.relatedKey} = ${this.pivotTable}.${this.relatedPivotKey}
      WHERE ${this.pivotTable}.${this.foreignPivotKey} = ?
        AND ${this.pivotTable}.${this.morphTypeColumn} = ?
    `;

    const result = await relatedRepository.query(query, [parentId, parentType]);
    return parseInt(result[0].count, 10);
  }

  /**
   * Attach related models
   */
  public async attach(models: T[] | number[], pivotAttributes?: Record<string, any>): Promise<void> {
    const parentId = (this.parent as any)[this.parentKey];
    if (!parentId) {
      throw new Error('Parent model must be saved before attaching related models');
    }

    const parentType = this.getParentType();
    const RelatedModel = this.related;
    const relatedRepository = RelatedModel.getRepository();

    for (const modelOrId of models) {
      const relatedId = typeof modelOrId === 'number' ? modelOrId : (modelOrId as any).id;
      
      const pivotData: any = {
        [this.foreignPivotKey]: parentId,
        [this.relatedPivotKey]: relatedId,
        [this.morphTypeColumn]: parentType,
        [this.morphIdColumn]: parentId,
        ...pivotAttributes,
      };

      const columns = Object.keys(pivotData);
      const values = Object.values(pivotData);
      const placeholders = values.map(() => '?').join(', ');
      const query = `
        INSERT INTO ${this.pivotTable} (${columns.join(', ')}) 
        VALUES (${placeholders})
      `;
      
      await relatedRepository.query(query, values);
    }
  }

  /**
   * Detach related models
   */
  public async detach(models?: T[] | number[]): Promise<void> {
    const parentId = (this.parent as any)[this.parentKey];
    if (!parentId) {
      return;
    }

    const parentType = this.getParentType();
    const RelatedModel = this.related;
    const relatedRepository = RelatedModel.getRepository();

    if (models && models.length > 0) {
      const ids = models.map(m => typeof m === 'number' ? m : (m as any).id);
      const placeholders = ids.map(() => '?').join(', ');
      const query = `
        DELETE FROM ${this.pivotTable}
        WHERE ${this.foreignPivotKey} = ? 
          AND ${this.morphTypeColumn} = ?
          AND ${this.relatedPivotKey} IN (${placeholders})
      `;
      await relatedRepository.query(query, [parentId, parentType, ...ids]);
    } else {
      const query = `
        DELETE FROM ${this.pivotTable}
        WHERE ${this.foreignPivotKey} = ?
          AND ${this.morphTypeColumn} = ?
      `;
      await relatedRepository.query(query, [parentId, parentType]);
    }
  }

  /**
   * Sync related models
   */
  public async sync(models: T[] | number[], detaching: boolean = true): Promise<void> {
    if (detaching) {
      await this.detach();
    }
    await this.attach(models);
  }

  /**
   * Toggle related models
   */
  public async toggle(models: T[] | number[]): Promise<void> {
    const current = await this.get();
    const currentIds = current.map((m: any) => m.id);
    const toggleIds = models.map(m => typeof m === 'number' ? m : (m as any).id);

    const toAttach = toggleIds.filter(id => !currentIds.includes(id));
    const toDetach = currentIds.filter(id => toggleIds.includes(id));

    if (toAttach.length > 0) {
      await this.attach(toAttach);
    }
    if (toDetach.length > 0) {
      await this.detach(toDetach);
    }
  }
}
