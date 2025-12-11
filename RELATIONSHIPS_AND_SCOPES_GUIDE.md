# Relationships and Query Scopes Guide

## Eloquent-Style Relationships

NodeRex now supports Laravel-style relationships! Define relationships in your models and use them just like in Laravel.

### HasMany Relationship

A one-to-many relationship where one model has many related models.

```typescript
import { Entity, Column, OneToMany } from 'typeorm';
import { Model } from './Model';
import { Post } from './Post';

@Entity('users')
export class User extends Model {
  @Column()
  name!: string;

  @Column()
  email!: string;

  // Define relationship
  public posts() {
    return this.hasMany(Post, 'user_id');
  }
}

// Usage
const user = await User.findOne({ where: { id: 1 } });
const posts = await user.posts().get();
const postCount = await user.posts().count();

// Create related model
const newPost = await user.posts().create({
  title: 'New Post',
  content: 'Post content'
});

// Attach existing posts
const existingPosts = await Post.find({ where: { id: [1, 2, 3] } });
await user.posts().attach(existingPosts);

// Detach posts
await user.posts().detach(existingPosts);
```

### BelongsTo Relationship

A many-to-one relationship where a model belongs to another model.

```typescript
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Model } from './Model';
import { User } from './User';

@Entity('posts')
export class Post extends Model {
  @Column()
  title!: string;

  @Column()
  content!: string;

  @Column()
  user_id!: number;

  // Define relationship
  public user() {
    return this.belongsTo(User, 'user_id');
  }
}

// Usage
const post = await Post.findOne({ where: { id: 1 } });
const user = await post.user().get();

// Associate user
const user = await User.findOne({ where: { id: 1 } });
await post.user().associate(user);

// Dissociate user
await post.user().dissociate();
```

### HasOne Relationship

A one-to-one relationship where one model has one related model.

```typescript
import { Entity, Column } from 'typeorm';
import { Model } from './Model';
import { Profile } from './Profile';

@Entity('users')
export class User extends Model {
  @Column()
  name!: string;

  // Define relationship
  public profile() {
    return this.hasOne(Profile, 'user_id');
  }
}

// Usage
const user = await User.findOne({ where: { id: 1 } });
const profile = await user.profile().get();

// Create profile
const newProfile = await user.profile().create({
  bio: 'User bio',
  avatar: 'avatar.jpg'
});

// Update or create
await user.profile().updateOrCreate(
  { user_id: user.id },
  { bio: 'Updated bio' }
);
```

### BelongsToMany Relationship

A many-to-many relationship through a pivot table.

```typescript
import { Entity, Column } from 'typeorm';
import { Model } from './Model';
import { Role } from './Role';

@Entity('users')
export class User extends Model {
  @Column()
  name!: string;

  // Define relationship
  public roles() {
    return this.belongsToMany(Role, 'user_roles', 'user_id', 'role_id');
  }
}

@Entity('roles')
export class Role extends Model {
  @Column()
  name!: string;
}

// Usage
const user = await User.findOne({ where: { id: 1 } });
const roles = await user.roles().get();
const roleCount = await user.roles().count();

// Attach roles
const adminRole = await Role.findOne({ where: { name: 'admin' } });
await user.roles().attach([adminRole]);

// Or attach by ID
await user.roles().attach([1, 2, 3]);

// Detach roles
await user.roles().detach([adminRole]);

// Sync roles (detach all and attach new ones)
await user.roles().sync([1, 2, 3]);

// Toggle roles (attach if detached, detach if attached)
await user.roles().toggle([1, 2]);
```

## Query Scopes

Query scopes allow you to encapsulate query logic and reuse it throughout your application.

### Global Scopes

Global scopes are automatically applied to all queries for a model.

```typescript
import { Model } from './Model';

@Entity('posts')
export class Post extends Model {
  @Column()
  title!: string;

  @Column()
  published!: boolean;

  @Column()
  deleted_at!: Date | null;

  // Define global scope
  public static boot() {
    super.boot();
    
    // Add global scope for published posts
    Post.addGlobalScope('published', (query) => {
      return query.where('published = :published', { published: true });
    });

    // Add global scope for soft deletes
    Post.addGlobalScope('notDeleted', (query) => {
      return query.where('deleted_at IS NULL');
    });
  }
}

// All queries automatically apply global scopes
const posts = await Post.find(); // Only returns published, non-deleted posts

// Query without global scopes
const allPosts = await Post.withoutGlobalScopes().getMany();

// Query without specific global scope
const allPostsIncludingUnpublished = await Post.withoutGlobalScopes('published').getMany();
```

### Local Scopes

Local scopes are reusable query constraints that you can chain.

```typescript
import { Model } from './Model';

@Entity('posts')
export class Post extends Model {
  @Column()
  title!: string;

  @Column()
  published!: boolean;

  @Column()
  views!: number;

  @CreateDateColumn()
  created_at!: Date;

  // Define local scope as static method
  public static scopePublished(query: any) {
    return query.where('published = :published', { published: true });
  }

  public static scopePopular(query: any, minViews: number = 100) {
    return query.where('views >= :minViews', { minViews });
  }

  public static scopeRecent(query: any, days: number = 7) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return query.where('created_at >= :date', { date });
  }
}

// Usage - chain scopes
const popularPosts = await Post.scope('popular', 1000).getMany();
const recentPopularPosts = await Post.scope('popular', 500)
  .scope('recent', 30)
  .getMany();

// Or use query builder directly
const posts = await Post.query()
  .where('published = :published', { published: true })
  .orderBy('created_at', 'DESC')
  .getMany();
```

### Combining Scopes and Relationships

```typescript
// Get user's published posts
const user = await User.findOne({ where: { id: 1 } });
const publishedPosts = await user.posts()
  .getQuery()
  .where('published = :published', { published: true })
  .getMany();

// Get user with recent posts
const userWithRecentPosts = await User.findOne({
  where: { id: 1 },
  relations: ['posts']
});

// Filter related posts
const recentPosts = userWithRecentPosts.posts.filter(post => {
  const daysAgo = new Date();
  daysAgo.setDate(daysAgo.getDate() - 7);
  return post.created_at >= daysAgo;
});
```

## Complete Example

```typescript
import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Model } from './Model';

@Entity('users')
export class User extends Model {
  @Column()
  name!: string;

  @Column()
  email!: string;

  // Relationships
  public posts() {
    return this.hasMany(Post, 'user_id');
  }

  public profile() {
    return this.hasOne(Profile, 'user_id');
  }

  public roles() {
    return this.belongsToMany(Role, 'user_roles', 'user_id', 'role_id');
  }

  // Scopes
  public static scopeActive(query: any) {
    return query.where('active = :active', { active: true });
  }

  public static boot() {
    super.boot();
    User.addGlobalScope('notDeleted', (query) => {
      return query.where('deleted_at IS NULL');
    });
  }
}

@Entity('posts')
export class Post extends Model {
  @Column()
  title!: string;

  @Column()
  content!: string;

  @Column()
  user_id!: number;

  @Column()
  published!: boolean;

  @Column()
  views!: number;

  // Relationships
  public user() {
    return this.belongsTo(User, 'user_id');
  }

  // Scopes
  public static scopePublished(query: any) {
    return query.where('published = :published', { published: true });
  }

  public static scopePopular(query: any, minViews: number = 100) {
    return query.where('views >= :minViews', { minViews });
  }
}

// Usage examples
const user = await User.scope('active').findOne({ where: { id: 1 } });
const posts = await user.posts().get();
const publishedPosts = await Post.scope('published').find();
const popularPosts = await Post.scope('popular', 1000).find();
```

## Benefits

1. **Type Safety**: Full TypeScript support for relationships
2. **Laravel Familiarity**: Same API as Laravel Eloquent
3. **Reusability**: Scopes can be chained and reused
4. **Performance**: Efficient queries with proper joins
5. **Flexibility**: Global and local scopes for different use cases
