import { Controller } from './Controller';
import { User } from '../Models/User';
import { UserResource } from '../Http/Resources/UserResource';
import { CreateUserRequest } from '../Http/Requests/CreateUserRequest';
import { UpdateUserRequest } from '../Http/Requests/UpdateUserRequest';

/**
 * User Controller
 * Handles user-related HTTP requests
 */
export class UserController extends Controller {
  /**
   * Display a listing of users
   */
  public async index(): Promise<void> {
    try {
      const users = await User.find();
      const userResources = UserResource.collection(users);
      
      this.success(userResources.map(resource => resource.toArray()));
    } catch (error) {
      this.error('Failed to fetch users', 500);
    }
  }

  /**
   * Display the specified user
   */
  public async show(): Promise<void> {
    try {
      const id = this.input('id');
      const user = await User.findOne({ where: { id } });

      if (!user) {
        this.notFound('User not found');
        return;
      }

      const userResource = new UserResource(user);
      this.success(userResource.toArray());
    } catch (error) {
      this.error('Failed to fetch user', 500);
    }
  }

  /**
   * Store a newly created user
   */
  public async store(): Promise<void> {
    try {
      const request = this.getRequest().body as CreateUserRequest;
      const user = new User();
      
      user.name = request.name;
      user.email = request.email;
      user.password = request.password; // In real app, hash this

      await user.save();
      
      const userResource = new UserResource(user);
      this.created(userResource.toArray(), 'User created successfully');
    } catch (error) {
      this.error('Failed to create user', 500);
    }
  }

  /**
   * Update the specified user
   */
  public async update(): Promise<void> {
    try {
      const id = this.input('id');
      const request = this.getRequest().body as UpdateUserRequest;
      
      const user = await User.findOne({ where: { id } });

      if (!user) {
        this.notFound('User not found');
        return;
      }

      if (request.name) user.name = request.name;
      if (request.email) user.email = request.email;

      await user.save();
      
      const userResource = new UserResource(user);
      this.success(userResource.toArray(), 'User updated successfully');
    } catch (error) {
      this.error('Failed to update user', 500);
    }
  }

  /**
   * Remove the specified user
   */
  public async destroy(): Promise<void> {
    try {
      const id = this.input('id');
      const user = await User.findOne({ where: { id } });

      if (!user) {
        this.notFound('User not found');
        return;
      }

      await user.remove();
      this.success(null, 'User deleted successfully');
    } catch (error) {
      this.error('Failed to delete user', 500);
    }
  }
}
