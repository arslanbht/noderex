"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const Controller_1 = require("./Controller");
const User_1 = require("../Models/User");
const UserResource_1 = require("../Http/Resources/UserResource");
/**
 * User Controller
 * Handles user-related HTTP requests
 */
class UserController extends Controller_1.Controller {
    /**
     * Display a listing of users
     */
    async index() {
        try {
            const users = await User_1.User.find();
            const userResources = UserResource_1.UserResource.collection(users);
            this.success(userResources.map(resource => resource.toArray()));
        }
        catch (error) {
            this.error('Failed to fetch users', 500);
        }
    }
    /**
     * Display the specified user
     */
    async show() {
        try {
            const id = this.input('id');
            const user = await User_1.User.findOne({ where: { id } });
            if (!user) {
                this.notFound('User not found');
                return;
            }
            const userResource = new UserResource_1.UserResource(user);
            this.success(userResource.toArray());
        }
        catch (error) {
            this.error('Failed to fetch user', 500);
        }
    }
    /**
     * Store a newly created user
     */
    async store() {
        try {
            const request = this.getRequest().body;
            const user = new User_1.User();
            user.name = request.name;
            user.email = request.email;
            user.password = request.password; // In real app, hash this
            await user.save();
            const userResource = new UserResource_1.UserResource(user);
            this.created(userResource.toArray(), 'User created successfully');
        }
        catch (error) {
            this.error('Failed to create user', 500);
        }
    }
    /**
     * Update the specified user
     */
    async update() {
        try {
            const id = this.input('id');
            const request = this.getRequest().body;
            const user = await User_1.User.findOne({ where: { id } });
            if (!user) {
                this.notFound('User not found');
                return;
            }
            if (request.name)
                user.name = request.name;
            if (request.email)
                user.email = request.email;
            await user.save();
            const userResource = new UserResource_1.UserResource(user);
            this.success(userResource.toArray(), 'User updated successfully');
        }
        catch (error) {
            this.error('Failed to update user', 500);
        }
    }
    /**
     * Remove the specified user
     */
    async destroy() {
        try {
            const id = this.input('id');
            const user = await User_1.User.findOne({ where: { id } });
            if (!user) {
                this.notFound('User not found');
                return;
            }
            await user.remove();
            this.success(null, 'User deleted successfully');
        }
        catch (error) {
            this.error('Failed to delete user', 500);
        }
    }
}
exports.UserController = UserController;
//# sourceMappingURL=UserController.js.map