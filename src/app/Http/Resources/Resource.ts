/**
 * Base Resource class for NodeRex framework
 * Provides data transformation functionality for API responses
 */
export abstract class Resource {
  protected resource: any;

  constructor(resource: any) {
    this.resource = resource;
  }

  /**
   * Transform the resource data
   */
  public abstract transform(): Record<string, any>;

  /**
   * Get the transformed data
   */
  public toArray(): Record<string, any> {
    return this.transform();
  }

  /**
   * Get the resource as JSON
   */
  public toJSON(): string {
    return JSON.stringify(this.toArray());
  }

  /**
   * Create a new resource instance
   */
  public static make(resource: any): Resource {
    return new (this as any)(resource);
  }

  /**
   * Create a collection of resources
   */
  public static collection(resources: any[]): Resource[] {
    return resources.map(resource => this.make(resource));
  }

  /**
   * Transform a collection of resources
   */
  public static transformCollection(resources: any[]): Record<string, any>[] {
    return this.collection(resources).map(resource => resource.toArray());
  }

  /**
   * Hide specified attributes from the resource
   */
  protected hide(attributes: string[]): Record<string, any> {
    const data = this.resource;
    const result = { ...data };
    
    attributes.forEach(attr => {
      delete result[attr];
    });
    
    return result;
  }

  /**
   * Show only specified attributes from the resource
   */
  protected only(attributes: string[]): Record<string, any> {
    const data = this.resource;
    const result: Record<string, any> = {};
    
    attributes.forEach(attr => {
      if (attr in data) {
        result[attr] = data[attr];
      }
    });
    
    return result;
  }

  /**
   * Append additional data to the resource
   */
  protected append(data: Record<string, any>): Record<string, any> {
    return {
      ...this.resource,
      ...data
    };
  }

  /**
   * Conditionally include data based on a condition
   */
  protected when(condition: boolean, value: any, defaultValue: any = null): any {
    return condition ? value : defaultValue;
  }

  /**
   * Conditionally include data based on a callback
   */
  protected whenCallback(condition: boolean, callback: () => any, defaultValue: any = null): any {
    return condition ? callback() : defaultValue;
  }
}

/**
 * Base Collection Resource class for handling arrays of resources
 */
export abstract class ResourceCollection {
  protected resources: any[];

  constructor(resources: any[]) {
    this.resources = resources;
  }

  /**
   * Transform each resource in the collection
   */
  public abstract transform(): Record<string, any>[];

  /**
   * Get the transformed data
   */
  public toArray(): Record<string, any>[] {
    return this.transform();
  }

  /**
   * Get the collection as JSON
   */
  public toJSON(): string {
    return JSON.stringify(this.toArray());
  }

  /**
   * Get additional metadata for the collection
   */
  protected getMeta(): Record<string, any> {
    return {
      count: this.resources.length,
      total: this.resources.length
    };
  }

  /**
   * Include metadata in the response
   */
  public withMeta(): Record<string, any> {
    return {
      data: this.toArray(),
      meta: this.getMeta()
    };
  }
}
