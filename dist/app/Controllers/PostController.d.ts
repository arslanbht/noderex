import { Controller } from './Controller';
/**
 * Post Controller
 * Handles post-related HTTP requests
 */
export declare class PostController extends Controller {
    /**
     * Display a listing of posts
     */
    index(): Promise<void>;
    /**
     * Store a newly created post
     */
    store(): Promise<void>;
    /**
     * Display the specified post
     */
    show(): Promise<void>;
    /**
     * Update the specified post
     */
    update(): Promise<void>;
    /**
     * Remove the specified post
     */
    destroy(): Promise<void>;
}
//# sourceMappingURL=PostController.d.ts.map