/**
 * Base Resource class for NodeRex framework
 * Provides data transformation functionality for API responses
 */
export declare abstract class Resource {
    protected resource: any;
    constructor(resource: any);
    /**
     * Transform the resource data
     */
    abstract transform(): Record<string, any>;
    /**
     * Get the transformed data
     */
    toArray(): Record<string, any>;
    /**
     * Get the resource as JSON
     */
    toJSON(): string;
    /**
     * Create a new resource instance
     */
    static make(resource: any): Resource;
    /**
     * Create a collection of resources
     */
    static collection(resources: any[]): Resource[];
    /**
     * Transform a collection of resources
     */
    static transformCollection(resources: any[]): Record<string, any>[];
    /**
     * Hide specified attributes from the resource
     */
    protected hide(attributes: string[]): Record<string, any>;
    /**
     * Show only specified attributes from the resource
     */
    protected only(attributes: string[]): Record<string, any>;
    /**
     * Append additional data to the resource
     */
    protected append(data: Record<string, any>): Record<string, any>;
    /**
     * Conditionally include data based on a condition
     */
    protected when(condition: boolean, value: any, defaultValue?: any): any;
    /**
     * Conditionally include data based on a callback
     */
    protected whenCallback(condition: boolean, callback: () => any, defaultValue?: any): any;
}
/**
 * Base Collection Resource class for handling arrays of resources
 */
export declare abstract class ResourceCollection {
    protected resources: any[];
    constructor(resources: any[]);
    /**
     * Transform each resource in the collection
     */
    abstract transform(): Record<string, any>[];
    /**
     * Get the transformed data
     */
    toArray(): Record<string, any>[];
    /**
     * Get the collection as JSON
     */
    toJSON(): string;
    /**
     * Get additional metadata for the collection
     */
    protected getMeta(): Record<string, any>;
    /**
     * Include metadata in the response
     */
    withMeta(): Record<string, any>;
}
//# sourceMappingURL=Resource.d.ts.map