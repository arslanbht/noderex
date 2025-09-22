import { Resource } from './Resource';

/**
 * User Resource
 * Transforms user data for API responses
 */
export class UserResource extends Resource {
  /**
   * Transform the user data
   */
  public transform(): Record<string, any> {
    return {
      id: this.resource.id,
      name: this.resource.name,
      email: this.resource.email,
      avatar: this.resource.avatar,
      email_verified_at: this.resource.email_verified_at,
      is_active: this.resource.is_active,
      created_at: this.resource.created_at,
      updated_at: this.resource.updated_at
    };
  }

  /**
   * Transform user data for public API (minimal information)
   */
  public toPublic(): Record<string, any> {
    return {
      id: this.resource.id,
      name: this.resource.name,
      avatar: this.resource.avatar
    };
  }

  /**
   * Transform user data for profile API (detailed information)
   */
  public toProfile(): Record<string, any> {
    return {
      id: this.resource.id,
      name: this.resource.name,
      email: this.resource.email,
      avatar: this.resource.avatar,
      email_verified_at: this.resource.email_verified_at,
      is_active: this.resource.is_active,
      created_at: this.resource.created_at,
      updated_at: this.resource.updated_at
    };
  }
}
