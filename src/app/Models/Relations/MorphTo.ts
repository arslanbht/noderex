import { Model } from '../Model';
import { SelectQueryBuilder } from 'typeorm';

/**
 * MorphTo relationship class
 * Represents a polymorphic belongs-to relationship
 * Used when a model can belong to multiple other models
 */
export class MorphTo<T extends Model> {
  private parent: Model;
  private morphTypeColumn: string;
  private morphIdColumn: string;
  private morphMap: Record<string, new () => T>;

  constructor(
    parent: Model,
    morphTypeColumn: string = 'morphable_type',
    morphIdColumn: string = 'morphable_id',
    morphMap?: Record<string, new () => T>
  ) {
    this.parent = parent;
    this.morphTypeColumn = morphTypeColumn;
    this.morphIdColumn = morphIdColumn;
    this.morphMap = morphMap || {};
  }

  /**
   * Set the morph map
   */
  public setMorphMap(morphMap: Record<string, new () => T>): void {
    this.morphMap = morphMap;
  }

  /**
   * Get the related model
   */
  public async get(): Promise<T | null> {
    const morphType = (this.parent as any)[this.morphTypeColumn];
    const morphId = (this.parent as any)[this.morphIdColumn];

    if (!morphType || !morphId) {
      return null;
    }

    // Get model class from morph map or use morphType directly
    const ModelClass = this.morphMap[morphType] || this.getModelClassFromType(morphType);
    
    if (!ModelClass) {
      return null;
    }

    const repository = ModelClass.getRepository();
    return await repository.findOne({
      where: { id: morphId } as any,
    }) as T | null;
  }

  /**
   * Associate a related model
   */
  public async associate(model: T): Promise<void> {
    const modelName = model.constructor.name;
    const modelType = this.getTypeFromModelName(modelName);
    
    (this.parent as any)[this.morphTypeColumn] = modelType;
    (this.parent as any)[this.morphIdColumn] = (model as any).id;
    
    await this.parent.save();
  }

  /**
   * Dissociate the related model
   */
  public async dissociate(): Promise<void> {
    (this.parent as any)[this.morphTypeColumn] = null;
    (this.parent as any)[this.morphIdColumn] = null;
    
    await this.parent.save();
  }

  /**
   * Get model class from type string
   */
  private getModelClassFromType(type: string): new () => T | null {
    // Try to find in morph map first
    if (this.morphMap[type]) {
      return this.morphMap[type];
    }

    // Try to resolve from type string (e.g., "User" -> User class)
    // This requires the model to be registered globally or imported
    // For now, return null and require morphMap
    return null;
  }

  /**
   * Get type string from model name
   */
  private getTypeFromModelName(modelName: string): string {
    // Check morph map for reverse lookup
    for (const [type, ModelClass] of Object.entries(this.morphMap)) {
      if (ModelClass.name === modelName) {
        return type;
      }
    }
    
    // Default: use model name
    return modelName;
  }
}
