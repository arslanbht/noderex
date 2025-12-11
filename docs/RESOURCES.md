# API Resources

## Introduction

When building an API, you may need a transformation layer that sits between your Eloquent models and the JSON responses that are actually returned to your application's users. NodeRex's resource classes allow you to expressively and easily transform models and model collections into JSON.

## Generating Resources

To generate a resource class, you may use the `make:resource` Artisan command. By default, resources will be placed in the `src/app/Http/Resources` directory of your application:

```bash
npm run artisan make:resource UserResource
```

## Concept Overview

> **Note:** This is a high-level overview of resources. We highly recommend reading the other sections of this documentation to gain a deeper understanding of the customization and power that resources offer.

Resources are simple classes that transform a given model into an array. Think of resources as a transformation layer between your models and the JSON responses that are actually returned to your application's users.

For example, here is a simple `UserResource`:

```typescript
import { Resource } from 'noderex';

export class UserResource extends Resource {
  public transform(): Record<string, any> {
    return {
      id: this.resource.id,
      name: this.resource.name,
      email: this.resource.email,
    };
  }
}
```

Every resource class defines a `transform` method which returns the array of attributes that should be converted to JSON when the resource is returned as a response from a route or controller.

Note that we can access model properties directly from the `this.resource` property. This is because a resource class will automatically proxy property and method access to the underlying model for convenient access.

## Writing Resources

> **Tip:** If you can't find a method on the resource class, you can access the underlying model instance via the `this.resource` property.

### Relationships

If you would like to include related resources in your response, you may add them to your resource class's `transform` method. In this example, we'll use the `PostResource`'s `make` method to add the user's blog posts to the resource response:

```typescript
import { Resource } from 'noderex';
import { PostResource } from './PostResource';

export class UserResource extends Resource {
  public transform(): Record<string, any> {
    return {
      id: this.resource.id,
      name: this.resource.name,
      email: this.resource.email,
      posts: PostResource.transformCollection(this.resource.posts || []),
    };
  }
}
```

### Conditional Attributes

Sometimes you may wish to only include an attribute in a resource response if a given condition is met. For example, you may wish to only include a value if the current user is an "administrator". NodeRex provides a variety of helper methods to assist you in this situation. The `when` method may be used to conditionally add an attribute to a resource response:

```typescript
public transform(): Record<string, any> {
  return {
    id: this.resource.id,
    name: this.resource.name,
    email: this.resource.email,
    secret: this.when(this.resource.isAdmin, () => 'secret-value'),
  };
}
```

In this example, the `secret` key will only be returned in the resource response if the user's `isAdmin` property is `true`. If the condition is `false`, the `secret` key will be removed from the resource response before it is sent to the client.

The `when` method also accepts a default value as the third parameter:

```typescript
secret: this.when(this.resource.isAdmin, () => 'secret-value', 'default-value')
```

The `whenCallback` method may be used to conditionally add an attribute to a resource response based on a more complex condition:

```typescript
public transform(): Record<string, any> {
  return {
    id: this.resource.id,
    name: this.resource.name,
    posts_count: this.whenCallback(
      this.resource.posts,
      () => this.resource.posts.length,
      0
    ),
  };
}
```

### Merging Conditional Attributes

Sometimes you may have multiple conditional attributes that you would like to include in the resource response only if the same condition is met. In this case, you may use the `mergeWhen` method:

```typescript
public transform(): Record<string, any> {
  return {
    id: this.resource.id,
    name: this.resource.name,
    ...this.when(this.resource.isAdmin, {
      secret: 'secret-value',
      admin_data: 'admin-data',
    }),
  };
}
```

In this example, the `secret` and `admin_data` keys will only be included in the resource response if the user's `isAdmin` property is `true`.

## Resource Collections

### Collections

If you are returning a collection of resources or a paginated response, you should use the `collection` method when creating the resource instance in your route or controller:

```typescript
import { UserResource } from '../Resources/UserResource';

const users = await User.find();
return UserResource.transformCollection(users);
```

Of course, this does not allow any addition of metadata that might need to be returned with the collection. If you would like to customize the collection response, you may create a dedicated resource to represent the collection:

```typescript
import { ResourceCollection } from 'noderex';

export class UserCollection extends ResourceCollection {
  public transform(): Record<string, any>[] {
    return this.resources.map(user => UserResource.make(user).toArray());
  }

  protected getMeta(): Record<string, any> {
    return {
      total: this.resources.length,
      page: 1,
      per_page: 15,
    };
  }
}
```

After defining your collection resource, it may be returned from a route or controller:

```typescript
const users = await User.find();
return new UserCollection(users).withMeta();
```

## Data Wrapping

By default, your outermost resource is wrapped in a `data` key when the resource response is converted to JSON. So, for example, a typical resource collection response looks like this:

```json
{
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com"
    },
    {
      "id": 2,
      "name": "Jane Doe",
      "email": "jane@example.com"
    }
  ]
}
```

If you would like to use a custom key instead of `data`, you may define a `$wrap` property on the resource class:

```typescript
export class UserResource extends Resource {
  public static wrap = 'users';

  public transform(): Record<string, any> {
    return {
      id: this.resource.id,
      name: this.resource.name,
    };
  }
}
```

## Next Steps

Now that you've learned the basics of API resources, you may want to explore:

- **[Conditional Attributes](#conditional-attributes)** - Advanced resource features
- **[Resource Collections](#resource-collections)** - Working with collections
- **[Controllers](BASICS.md#controllers)** - Using resources in controllers
