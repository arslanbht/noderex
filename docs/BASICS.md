# The Basics

## Routing

### Basic Routing

The most basic NodeRex routes accept a URI and a closure, providing a very simple and expressive method of defining routes:

```typescript
import { Router } from 'noderex';

const router = new Router(app);

router.get('/greeting', (req, res) => {
  res.json({ message: 'Hello World' });
});
```

### Available Router Methods

The router allows you to register routes that respond to any HTTP verb:

```typescript
router.get('/users', handler);
router.post('/users', handler);
router.put('/users/:id', handler);
router.patch('/users/:id', handler);
router.delete('/users/:id', handler);
router.any('/users', handler); // Matches any HTTP method
```

### Route Parameters

#### Required Parameters

Sometimes you will need to capture segments of the URI within your route. For example, you may need to capture a user's ID from the URL. You may do so by defining route parameters:

```typescript
router.get('/user/:id', (req, res) => {
  const userId = req.params.id;
  res.json({ userId });
});
```

You may define as many route parameters as required by your route:

```typescript
router.get('/posts/:postId/comments/:commentId', (req, res) => {
  const { postId, commentId } = req.params;
  res.json({ postId, commentId });
});
```

### Route Groups

Route groups allow you to share route attributes, such as middleware or prefixes, across a large number of routes without needing to define those attributes on each individual route.

#### Middleware

To assign middleware to all routes within a group, you may use the middleware method before defining the group:

```typescript
router.group('/admin', (router) => {
  router.get('/users', handler);
  router.get('/posts', handler);
}, ['auth', 'admin']);
```

#### Route Prefixes

The `group` method may be used to prefix each route in the group with a given URI. For example, you may want to prefix all route URIs within the group with `admin`:

```typescript
router.group('/admin', (router) => {
  router.get('/users', handler); // Matches /admin/users
  router.get('/posts', handler);  // Matches /admin/posts
});
```

### Resource Routes

#### API Resource Routes

When declaring resource routes that will be consumed by APIs, you will commonly want to exclude routes that present HTML templates such as `create` and `edit`. For convenience, you may use the `apiResource` method to automatically exclude these two routes:

```typescript
router.apiResource('photos', 'PhotoController');
```

This single route declaration creates multiple routes to handle a variety of actions on the resource:

| Method | URI | Action | Route Name |
|--------|-----|--------|------------|
| GET | /photos | index | photos.index |
| POST | /photos | store | photos.store |
| GET | /photos/:id | show | photos.show |
| PUT/PATCH | /photos/:id | update | photos.update |
| DELETE | /photos/:id | destroy | photos.destroy |

## Controllers

### Introduction

Instead of defining all of your request handling logic as closures in your route files, you may wish to organize this behavior using "controller" classes. Controllers can group related request handling logic into a single class.

### Writing Controllers

#### Basic Controllers

Below is an example of a basic controller class. All NodeRex controllers should extend the base `Controller` class included with the default NodeRex installation:

```typescript
import { Controller } from 'noderex';
import { User } from '../Models/User';

export class UserController extends Controller {
  public async index(): Promise<void> {
    const users = await User.find();
    this.success(users);
  }

  public async show(): Promise<void> {
    const id = parseInt(this.input('id'));
    const user = await User.findOne({ where: { id } });
    
    if (!user) {
      this.notFound('User not found');
      return;
    }

    this.success(user);
  }
}
```

#### Controller Methods

Controllers may return responses directly:

```typescript
public async store(): Promise<void> {
  const user = new User();
  user.fill(this.all());
  await user.save();
  
  this.created(user, 'User created successfully');
}
```

### Controller Middleware

Middleware may be assigned to the controller's routes in your route files:

```typescript
router.post('/users', validateRequest(CreateUserRequest), 'UserController@store');
```

Or, you may wish to specify middleware within your controller's constructor:

```typescript
export class UserController extends Controller {
  constructor() {
    super();
    // Middleware can be applied here if needed
  }
}
```

## HTTP Requests

### Accessing The Request

To obtain an instance of the current HTTP request, you should use the `Controller` methods:

```typescript
public async store(): Promise<void> {
  // Get all input
  const all = this.all();
  
  // Get specific input
  const name = this.input('name');
  const email = this.input('email', 'default@example.com');
  
  // Get only specified inputs
  const data = this.only(['name', 'email']);
  
  // Get all except specified inputs
  const filtered = this.except(['password']);
  
  // Check if input exists
  if (this.has('name')) {
    // Name is present
  }
  
  // Check if input is filled
  if (this.filled('name')) {
    // Name has a value
  }
}
```

### Old Input

NodeRex allows you to keep input from one request during the next request. This feature is particularly useful for re-populating forms after detecting validation errors.

## HTTP Responses

### Basic Responses

#### Returning Strings

The most basic response is returning a string from a route or controller:

```typescript
router.get('/', (req, res) => {
  res.send('Hello World');
});
```

#### Response Objects

Typically, you won't just be returning simple strings from your route actions. Instead, you will be returning full response objects:

```typescript
public async index(): Promise<void> {
  const users = await User.find();
  this.success(users);
}
```

### Response Helpers

#### JSON Responses

The `success` method will automatically set the `Content-Type` header to `application/json`:

```typescript
this.success({ name: 'John' });
```

#### Created Responses

The `created` method returns a 201 status code:

```typescript
this.created(user, 'User created successfully');
```

#### Error Responses

The `error` method returns an error response:

```typescript
this.error('Something went wrong', 500);
this.validationError({ email: ['Email is required'] });
```

## Validation

### Introduction

NodeRex provides several different approaches to validate your application's incoming data. It is most common to use the `validateRequest` middleware with form request classes.

### Form Request Validation

#### Creating Form Requests

For more complex validation scenarios, you may wish to create a "form request". Form requests are custom request classes that contain validation logic. To create a form request class, use the `make:request` Artisan command:

```bash
npm run artisan make:request StorePostRequest
```

The generated form request class will be placed in the `src/app/Http/Requests` directory. Let's add a few validation rules to the `rules` method:

```typescript
import { Request, Validation } from 'noderex';

export class StorePostRequest extends Request {
  public rules(): Record<string, any> {
    return {
      title: [
        Validation.required(),
        Validation.min(5),
        Validation.max(255),
      ],
      body: [
        Validation.required(),
        Validation.min(10),
      ],
    };
  }
}
```

#### Authorizing Form Requests

The form request class also contains an `authorize` method. Within this method, you may check if the authenticated user actually has authority to update the given resource:

```typescript
public authorize(): boolean {
  const post = Post.findOne({ where: { id: this.input('id') } });
  return post.user_id === this.getRequest().user.id;
}
```

#### Customizing Error Messages

You may customize the error messages used by the form request by overriding the `messages` method:

```typescript
public messages(): Record<string, string> {
  return {
    'title.required': 'A title is required',
    'body.required': 'A message is required',
  };
}
```

### Manually Creating Validators

If you do not want to use the `validateRequest` middleware, you may manually create a validator instance using the `Request` class:

```typescript
const request = new StorePostRequest();
request.setData(req.body);
const validated = await request.validate();
```

## Middleware

### Introduction

Middleware provide a convenient mechanism for inspecting and filtering HTTP requests entering your application. For example, NodeRex includes a middleware that verifies the user of your application is authenticated.

### Defining Middleware

To create a new middleware, use the `make:middleware` Artisan command:

```bash
npm run artisan make:middleware EnsureTokenIsValid
```

This command will place a new `EnsureTokenIsValid` class in your `src/app/Middleware` directory. In this middleware, we will only allow access to the route if the supplied `token` input matches a specified value:

```typescript
import { Request, Response, NextFunction } from 'express';

export function ensureTokenIsValid(req: Request, res: Response, next: NextFunction): void {
  if (req.input('token') !== 'my-secret-token') {
    return res.status(403).json({ message: 'Invalid token' });
  }

  next();
}
```

### Registering Middleware

#### Global Middleware

If you want a middleware to run during every HTTP request to your application, list the middleware class in the `setupMiddleware` method of your `NodeRexApplication` class.

#### Assigning Middleware To Routes

If you would like to assign middleware to specific routes, you may use the `middleware` method when defining the route:

```typescript
router.get('/admin', handler, ['auth']);
```

You may also assign multiple middleware to the route:

```typescript
router.get('/admin', handler, ['auth', 'admin']);
```

## Next Steps

Now that you've learned the basics, you may want to explore some of NodeRex's more advanced features:

- **[Eloquent ORM](ELOQUENT.md)** - Working with databases
- **[Validation](VALIDATION.md)** - Advanced validation techniques
- **[API Resources](RESOURCES.md)** - Transforming API responses
