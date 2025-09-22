import { Resource } from './Resource';

/**
 * TestResource
 */
export class TestResource extends Resource {
    /**
     * Transform the resource data
     */
    public transform(): Record<string, any> {
        return {
            // Add your transformation logic here
            // Example:
            // id: this.resource.id,
            // name: this.resource.name,
            // created_at: this.resource.created_at
        };
    }
}
