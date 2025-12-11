# Helper Functions

NodeRex provides utility helper functions for common operations.

## String Helpers

### `strRandom(length?: number): string`

Generate a random string.

```typescript
import { strRandom } from 'noderex';

const token = strRandom(32); // Random 32-character string
```

### `slugify(text: string): string`

Convert a string to a URL-friendly slug.

```typescript
import { slugify } from 'noderex';

const slug = slugify('Hello World!'); // 'hello-world'
```

### `truncate(str: string, length?: number, suffix?: string): string`

Truncate a string to a specified length.

```typescript
import { truncate } from 'noderex';

const short = truncate('Long text here', 10); // 'Long text...'
```

## Case Conversion

### `camelCase(str: string): string`

Convert string to camelCase.

```typescript
import { camelCase } from 'noderex';

camelCase('hello world'); // 'helloWorld'
```

### `snakeCase(str: string): string`

Convert string to snake_case.

```typescript
import { snakeCase } from 'noderex';

snakeCase('HelloWorld'); // 'hello_world'
```

### `kebabCase(str: string): string`

Convert string to kebab-case.

```typescript
import { kebabCase } from 'noderex';

kebabCase('HelloWorld'); // 'hello-world'
```

### `pascalCase(str: string): string`

Convert string to PascalCase.

```typescript
import { pascalCase } from 'noderex';

pascalCase('hello world'); // 'HelloWorld'
```

## Pluralization

### `pluralize(word: string): string`

Pluralize a word.

```typescript
import { pluralize } from 'noderex';

pluralize('user'); // 'users'
pluralize('child'); // 'children'
```

### `singularize(word: string): string`

Singularize a word.

```typescript
import { singularize } from 'noderex';

singularize('users'); // 'user'
singularize('children'); // 'child'
```

## Object Helpers

### `isEmpty(value: any): boolean`

Check if a value is empty.

```typescript
import { isEmpty } from 'noderex';

isEmpty(null); // true
isEmpty(''); // true
isEmpty([]); // true
isEmpty({}); // true
isEmpty('hello'); // false
```

### `get(obj: any, path: string, defaultValue?: any): any`

Get a nested object property using dot notation.

```typescript
import { get } from 'noderex';

const user = { profile: { name: 'John' } };
get(user, 'profile.name'); // 'John'
get(user, 'profile.age', 0); // 0 (default value)
```

### `set(obj: any, path: string, value: any): any`

Set a nested object property using dot notation.

```typescript
import { set } from 'noderex';

const user = {};
set(user, 'profile.name', 'John');
// user = { profile: { name: 'John' } }
```

### `clone<T>(obj: T): T`

Deep clone an object.

```typescript
import { clone } from 'noderex';

const original = { name: 'John', tags: ['admin'] };
const copied = clone(original);
```

### `merge(target: any, ...sources: any[]): any`

Deep merge objects.

```typescript
import { merge } from 'noderex';

const target = { a: 1, b: { c: 2 } };
const source = { b: { d: 3 }, e: 4 };
merge(target, source);
// { a: 1, b: { c: 2, d: 3 }, e: 4 }
```

## Formatting Helpers

### `formatBytes(bytes: number, decimals?: number): string`

Format bytes to human-readable string.

```typescript
import { formatBytes } from 'noderex';

formatBytes(1024); // '1 KB'
formatBytes(1048576); // '1 MB'
```

### `formatNumber(num: number): string`

Format number with commas.

```typescript
import { formatNumber } from 'noderex';

formatNumber(1000); // '1,000'
formatNumber(1000000); // '1,000,000'
```

## UUID

### `uuid(): string`

Generate a UUID v4.

```typescript
import { uuid } from 'noderex';

const id = uuid(); // 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
```

## Model Helpers

### `tableName(modelName: string): string`

Generate table name from model name.

```typescript
import { tableName } from 'noderex';

tableName('User'); // 'users'
tableName('UserProfile'); // 'user_profiles'
```

### `className(tableName: string): string`

Generate class name from table name.

```typescript
import { className } from 'noderex';

className('users'); // 'User'
className('user_profiles'); // 'UserProfile'
```

## Usage Examples

### In Controllers

```typescript
import { slugify, truncate, isEmpty } from 'noderex';

export class PostController extends Controller {
  public async store(): Promise<void> {
    const data = this.all();
    
    // Generate slug from title
    data.slug = slugify(data.title);
    
    // Truncate excerpt
    if (data.excerpt) {
      data.excerpt = truncate(data.excerpt, 150);
    }
    
    // Check if data is empty
    if (isEmpty(data.tags)) {
      data.tags = [];
    }
    
    const post = new Post();
    post.fill(data);
    await post.save();
    
    this.created(post);
  }
}
```

### In Models

```typescript
import { slugify, tableName } from 'noderex';

@Entity(tableName('Post'))
export class Post extends Model {
  @BeforeInsert()
  generateSlug() {
    if (!this.slug) {
      this.slug = slugify(this.title);
    }
  }
}
```

### In Migrations

```typescript
import { tableName } from 'noderex';

export class CreatePostsTable extends Migration {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await this.createTable(queryRunner, new Table({
      name: tableName('Post'), // 'posts'
      // ...
    }));
  }
}
```

## Complete Helper Reference

```typescript
// String
strRandom(length?: number): string
slugify(text: string): string
truncate(str: string, length?: number, suffix?: string): string

// Case Conversion
camelCase(str: string): string
snakeCase(str: string): string
kebabCase(str: string): string
pascalCase(str: string): string

// Pluralization
pluralize(word: string): string
singularize(word: string): string

// Object
isEmpty(value: any): boolean
get(obj: any, path: string, defaultValue?: any): any
set(obj: any, path: string, value: any): any
clone<T>(obj: T): T
merge(target: any, ...sources: any[]): any

// Formatting
formatBytes(bytes: number, decimals?: number): string
formatNumber(num: number): string

// UUID
uuid(): string

// Model
tableName(modelName: string): string
className(tableName: string): string
```
