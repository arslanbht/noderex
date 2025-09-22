"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostController = void 0;
const Controller_1 = require("./Controller");
/**
 * Post Controller
 * Handles post-related HTTP requests
 */
class PostController extends Controller_1.Controller {
    /**
     * Display a listing of posts
     */
    async index() {
        try {
            // In a real application, you would fetch posts from the database
            const posts = [
                { id: 1, title: 'First Post', content: 'This is the first post', created_at: new Date() },
                { id: 2, title: 'Second Post', content: 'This is the second post', created_at: new Date() }
            ];
            this.success(posts, 'Posts retrieved successfully');
        }
        catch (error) {
            this.error('Failed to fetch posts', 500);
        }
    }
    /**
     * Store a newly created post
     */
    async store() {
        try {
            const data = this.all();
            const post = {
                id: Math.floor(Math.random() * 1000),
                title: data.title,
                content: data.content,
                created_at: new Date()
            };
            this.created(post, 'Post created successfully');
        }
        catch (error) {
            this.error('Failed to create post', 500);
        }
    }
    /**
     * Display the specified post
     */
    async show() {
        try {
            const id = this.input('id');
            const post = {
                id: parseInt(id),
                title: `Post ${id}`,
                content: `This is post number ${id}`,
                created_at: new Date()
            };
            this.success(post, 'Post retrieved successfully');
        }
        catch (error) {
            this.error('Failed to fetch post', 500);
        }
    }
    /**
     * Update the specified post
     */
    async update() {
        try {
            const id = this.input('id');
            const data = this.all();
            const post = {
                id: parseInt(id),
                title: data.title || `Updated Post ${id}`,
                content: data.content || `Updated content for post ${id}`,
                updated_at: new Date()
            };
            this.success(post, 'Post updated successfully');
        }
        catch (error) {
            this.error('Failed to update post', 500);
        }
    }
    /**
     * Remove the specified post
     */
    async destroy() {
        try {
            const id = this.input('id');
            this.success(null, `Post ${id} deleted successfully`);
        }
        catch (error) {
            this.error('Failed to delete post', 500);
        }
    }
}
exports.PostController = PostController;
//# sourceMappingURL=PostController.js.map