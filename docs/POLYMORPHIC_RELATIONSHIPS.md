# Polymorphic Relationships Guide

Complete guide to polymorphic relationships in NodeRex, matching Laravel's polymorphic relationship system.

## Table of Contents

- [Introduction](#introduction)
- [MorphTo](#morphto)
- [MorphOne](#morphone)
- [MorphMany](#morphmany)
- [MorphToMany](#morphtomany)
- [MorphedByMany](#morphedbymany)
- [Complete Examples](#complete-examples)

## Introduction

Polymorphic relationships allow a model to belong to more than one other model on a single association. For example, a `Comment` model can belong to both a `Post` model and a `Video` model.

## MorphTo

A polymorphic belongs-to relationship. The model can belong to multiple other models.

### Database Structure

```typescript
// Comments table
{
  id: number;
  body: string;
  commentable_type: string; // 'Post' or 'Video'
  commentable_id: number;    // ID of Post or Video
}
```

### Model Definition

```typescript
import { Entity, Column } from 'typeorm';
import { Model } from 'noderex';
import { Post } from './Post';
import { Video } from './Video';

@Entity('comments')
export class Comment extends Model {
  @Column('text')
  body!: string;

  @Column()
  commentable_type!: string;

  @Column()
  commentable_id!: number;

  // Define morphTo relationship
  public commentable() {
    return this.morphTo<Post | Video>(
      'commentable_type',
      'commentable_id',
      {
        Post: Post,
        Video: Video,
      }
    );
  }
}
```

### Usage

```typescript
const comment = await Comment.findOne({ where: { id: 1 } });

// Get the related model (Post or Video)
const commentable = await comment.commentable().get();

// Associate a Post
const post = await Post.findOne({ where: { id: 1 } });
await comment.commentable().associate(post);

// Associate a Video
const video = await Video.findOne({ where: { id: 1 } });
await comment.commentable().associate(video);

// Dissociate
await comment.commentable().dissociate();
```

## MorphOne

A polymorphic one-to-one relationship. One model can have one related model of different types.

### Database Structure

```typescript
// Images table
{
  id: number;
  url: string;
  imageable_type: string; // 'Post' or 'User'
  imageable_id: number;    // ID of Post or User
}
```

### Model Definition

```typescript
import { Entity, Column } from 'typeorm';
import { Model } from 'noderex';

@Entity('images')
export class Image extends Model {
  @Column()
  url!: string;

  @Column()
  imageable_type!: string;

  @Column()
  imageable_id!: number;
}

@Entity('posts')
export class Post extends Model {
  @Column()
  title!: string;

  // Define morphOne relationship
  public image() {
    return this.morphOne(Image, 'imageable_type', 'imageable_id');
  }
}

@Entity('users')
export class User extends Model {
  @Column()
  name!: string;

  // Same relationship from User
  public image() {
    return this.morphOne(Image, 'imageable_type', 'imageable_id');
  }
}
```

### Usage

```typescript
const post = await Post.findOne({ where: { id: 1 } });

// Get the image
const image = await post.image().get();

// Create an image
const newImage = await post.image().create({
  url: 'https://example.com/image.jpg',
});

// Update or create
await post.image().updateOrCreate(
  { imageable_id: post.id, imageable_type: 'Post' },
  { url: 'https://example.com/new-image.jpg' }
);
```

## MorphMany

A polymorphic one-to-many relationship. One model can have many related models of different types.

### Database Structure

```typescript
// Comments table
{
  id: number;
  body: string;
  commentable_type: string; // 'Post' or 'Video'
  commentable_id: number;    // ID of Post or Video
}
```

### Model Definition

```typescript
@Entity('posts')
export class Post extends Model {
  @Column()
  title!: string;

  // Define morphMany relationship
  public comments() {
    return this.morphMany(Comment, 'commentable_type', 'commentable_id');
  }
}

@Entity('videos')
export class Video extends Model {
  @Column()
  title!: string;

  // Same relationship from Video
  public comments() {
    return this.morphMany(Comment, 'commentable_type', 'commentable_id');
  }
}
```

### Usage

```typescript
const post = await Post.findOne({ where: { id: 1 } });

// Get all comments
const comments = await post.comments().get();

// Get comment count
const count = await post.comments().count();

// Create a comment
const newComment = await post.comments().create({
  body: 'Great post!',
});

// Attach existing comments
const existingComments = await Comment.find({ where: { id: [1, 2, 3] } });
await post.comments().attach(existingComments);

// Detach comments
await post.comments().detach(existingComments);
```

## MorphToMany

A polymorphic many-to-many relationship. Multiple models can have many related models through a pivot table.

### Database Structure

```typescript
// Tags table
{
  id: number;
  name: string;
}

// Taggables pivot table
{
  tag_id: number;
  taggable_type: string; // 'Post' or 'Video'
  taggable_id: number;   // ID of Post or Video
}
```

### Model Definition

```typescript
@Entity('tags')
export class Tag extends Model {
  @Column()
  name!: string;
}

@Entity('posts')
export class Post extends Model {
  @Column()
  title!: string;

  // Define morphToMany relationship
  public tags() {
    return this.morphToMany(
      Tag,
      'taggables',
      'taggable_type',
      'taggable_id',
      'taggable_id',  // foreignPivotKey
      'tag_id'        // relatedPivotKey
    );
  }
}

@Entity('videos')
export class Video extends Model {
  @Column()
  title!: string;

  // Same relationship from Video
  public tags() {
    return this.morphToMany(
      Tag,
      'taggables',
      'taggable_type',
      'taggable_id',
      'taggable_id',
      'tag_id'
    );
  }
}
```

### Usage

```typescript
const post = await Post.findOne({ where: { id: 1 } });

// Get all tags
const tags = await post.tags().get();

// Get tag count
const count = await post.tags().count();

// Attach tags
const tag = await Tag.findOne({ where: { name: 'tech' } });
await post.tags().attach([tag]);

// Or attach by ID
await post.tags().attach([1, 2, 3]);

// Detach tags
await post.tags().detach([tag]);

// Sync tags (detach all and attach new ones)
await post.tags().sync([1, 2, 3]);

// Toggle tags
await post.tags().toggle([1, 2]);

// Attach with pivot attributes
await post.tags().attach([tag], {
  created_at: new Date(),
  user_id: 123,
});
```

## MorphedByMany

The inverse of MorphToMany. Used on the "related" model to access all models that have this relationship.

### Model Definition

```typescript
@Entity('tags')
export class Tag extends Model {
  @Column()
  name!: string;

  // Define morphedByMany relationship (inverse of morphToMany)
  public posts() {
    return this.morphedByMany(
      Post,
      'taggables',
      'taggable_type',
      'taggable_id',
      'tag_id',       // foreignPivotKey (tag's ID in pivot)
      'taggable_id'   // relatedPivotKey (Post's ID in pivot)
    );
  }

  public videos() {
    return this.morphedByMany(
      Video,
      'taggables',
      'taggable_type',
      'taggable_id',
      'tag_id',
      'taggable_id'
    );
  }
}
```

### Usage

```typescript
const tag = await Tag.findOne({ where: { name: 'tech' } });

// Get all posts with this tag
const posts = await tag.posts().get();

// Get all videos with this tag
const videos = await tag.videos().get();

// Get count
const postCount = await tag.posts().count();
```

## Complete Examples

### Example 1: Comments System

```typescript
// Comment model
@Entity('comments')
export class Comment extends Model {
  @Column('text')
  body!: string;

  @Column()
  commentable_type!: string;

  @Column()
  commentable_id!: number;

  public commentable() {
    return this.morphTo<Post | Video>(
      'commentable_type',
      'commentable_id',
      { Post: Post, Video: Video }
    );
  }
}

// Post model
@Entity('posts')
export class Post extends Model {
  @Column()
  title!: string;

  public comments() {
    return this.morphMany(Comment, 'commentable_type', 'commentable_id');
  }
}

// Video model
@Entity('videos')
export class Video extends Model {
  @Column()
  title!: string;

  public comments() {
    return this.morphMany(Comment, 'commentable_type', 'commentable_id');
  }
}

// Usage
const post = await Post.findOne({ where: { id: 1 } });
const comment = await post.comments().create({ body: 'Nice post!' });

const commentModel = await Comment.findOne({ where: { id: comment.id } });
const commentable = await commentModel.commentable().get(); // Returns Post
```

### Example 2: Tagging System

```typescript
// Tag model
@Entity('tags')
export class Tag extends Model {
  @Column()
  name!: string;

  public posts() {
    return this.morphedByMany(Post, 'taggables', 'taggable_type', 'taggable_id');
  }

  public videos() {
    return this.morphedByMany(Video, 'taggables', 'taggable_type', 'taggable_id');
  }
}

// Post model
@Entity('posts')
export class Post extends Model {
  @Column()
  title!: string;

  public tags() {
    return this.morphToMany(Tag, 'taggables', 'taggable_type', 'taggable_id');
  }
}

// Video model
@Entity('videos')
export class Video extends Model {
  @Column()
  title!: string;

  public tags() {
    return this.morphToMany(Tag, 'taggables', 'taggable_type', 'taggable_id');
  }
}

// Usage
const post = await Post.findOne({ where: { id: 1 } });
const tag = await Tag.findOne({ where: { name: 'tech' } });

// Tag the post
await post.tags().attach([tag]);

// Get all posts with this tag
const taggedPosts = await tag.posts().get();
```

### Example 3: Image Gallery

```typescript
// Image model
@Entity('images')
export class Image extends Model {
  @Column()
  url!: string;

  @Column()
  imageable_type!: string;

  @Column()
  imageable_id!: number;
}

// Post model
@Entity('posts')
export class Post extends Model {
  @Column()
  title!: string;

  public image() {
    return this.morphOne(Image, 'imageable_type', 'imageable_id');
  }
}

// User model
@Entity('users')
export class User extends Model {
  @Column()
  name!: string;

  public avatar() {
    return this.morphOne(Image, 'imageable_type', 'imageable_id');
  }
}

// Usage
const post = await Post.findOne({ where: { id: 1 } });
const image = await post.image().create({
  url: 'https://example.com/post-image.jpg',
});

const user = await User.findOne({ where: { id: 1 } });
const avatar = await user.avatar().create({
  url: 'https://example.com/avatar.jpg',
});
```

## Migration Examples

### MorphTo/MorphMany Migration

```typescript
export class CreateCommentsTable extends Migration {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await this.createTable(queryRunner, new Table({
      name: 'comments',
      columns: [
        Schema.id(),
        Schema.text('body', false),
        Schema.string('commentable_type', 255, false),
        Schema.integer('commentable_id', false),
        ...Schema.timestamps(),
      ],
      indices: [
        Index.index('comments_commentable_index', ['commentable_type', 'commentable_id']),
      ],
    }));
  }
}
```

### MorphToMany Migration

```typescript
export class CreateTaggablesTable extends Migration {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await this.createTable(queryRunner, new Table({
      name: 'taggables',
      columns: [
        Schema.integer('tag_id', false),
        Schema.string('taggable_type', 255, false),
        Schema.integer('taggable_id', false),
      ],
      indices: [
        Index.index('taggables_tag_index', ['tag_id']),
        Index.index('taggables_taggable_index', ['taggable_type', 'taggable_id']),
      ],
    }));
  }
}
```

## Best Practices

1. **Use Descriptive Column Names**: Use clear names like `commentable_type` instead of generic `type`
2. **Set Up Morph Map**: Always provide morph map for MorphTo relationships
3. **Add Indexes**: Index polymorphic columns for better performance
4. **Use Consistent Naming**: Keep naming consistent across your application
5. **Document Relationships**: Comment your relationships for clarity

## Performance Tips

1. **Eager Load**: Use eager loading when accessing polymorphic relationships
2. **Add Indexes**: Index `morphable_type` and `morphable_id` columns
3. **Use Caching**: Cache frequently accessed polymorphic relationships
4. **Limit Results**: Use pagination for MorphMany relationships

## Summary

- **MorphTo**: Polymorphic belongs-to (Comment → Post/Video)
- **MorphOne**: Polymorphic one-to-one (Post → Image)
- **MorphMany**: Polymorphic one-to-many (Post → Comments)
- **MorphToMany**: Polymorphic many-to-many (Post → Tags)
- **MorphedByMany**: Inverse of MorphToMany (Tag → Posts/Videos)

All polymorphic relationships work exactly like Laravel's Eloquent relationships!
