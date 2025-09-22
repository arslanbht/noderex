"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserResource = void 0;
const Resource_1 = require("./Resource");
/**
 * User Resource
 * Transforms user data for API responses
 */
class UserResource extends Resource_1.Resource {
    /**
     * Transform the user data
     */
    transform() {
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
    toPublic() {
        return {
            id: this.resource.id,
            name: this.resource.name,
            avatar: this.resource.avatar
        };
    }
    /**
     * Transform user data for profile API (detailed information)
     */
    toProfile() {
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
exports.UserResource = UserResource;
//# sourceMappingURL=UserResource.js.map