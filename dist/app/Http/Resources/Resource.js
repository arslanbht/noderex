"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourceCollection = exports.Resource = void 0;
/**
 * Base Resource class for NodeRex framework
 * Provides data transformation functionality for API responses
 */
class Resource {
    constructor(resource) {
        this.resource = resource;
    }
    /**
     * Get the transformed data
     */
    toArray() {
        return this.transform();
    }
    /**
     * Get the resource as JSON
     */
    toJSON() {
        return JSON.stringify(this.toArray());
    }
    /**
     * Create a new resource instance
     */
    static make(resource) {
        return new this(resource);
    }
    /**
     * Create a collection of resources
     */
    static collection(resources) {
        return resources.map(resource => this.make(resource));
    }
    /**
     * Transform a collection of resources
     */
    static transformCollection(resources) {
        return this.collection(resources).map(resource => resource.toArray());
    }
    /**
     * Hide specified attributes from the resource
     */
    hide(attributes) {
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
    only(attributes) {
        const data = this.resource;
        const result = {};
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
    append(data) {
        return {
            ...this.resource,
            ...data
        };
    }
    /**
     * Conditionally include data based on a condition
     */
    when(condition, value, defaultValue = null) {
        return condition ? value : defaultValue;
    }
    /**
     * Conditionally include data based on a callback
     */
    whenCallback(condition, callback, defaultValue = null) {
        return condition ? callback() : defaultValue;
    }
}
exports.Resource = Resource;
/**
 * Base Collection Resource class for handling arrays of resources
 */
class ResourceCollection {
    constructor(resources) {
        this.resources = resources;
    }
    /**
     * Get the transformed data
     */
    toArray() {
        return this.transform();
    }
    /**
     * Get the collection as JSON
     */
    toJSON() {
        return JSON.stringify(this.toArray());
    }
    /**
     * Get additional metadata for the collection
     */
    getMeta() {
        return {
            count: this.resources.length,
            total: this.resources.length
        };
    }
    /**
     * Include metadata in the response
     */
    withMeta() {
        return {
            data: this.toArray(),
            meta: this.getMeta()
        };
    }
}
exports.ResourceCollection = ResourceCollection;
//# sourceMappingURL=Resource.js.map