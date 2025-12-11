# Security

## Introduction

This document covers security best practices when developing NodeRex applications.

## Authentication

### Introduction

NodeRex does not include authentication scaffolding out of the box. However, you may use NodeRex's built-in security features to implement authentication yourself.

### Password Hashing

NodeRex uses `bcryptjs` for password hashing. The `bcryptjs` package is included in NodeRex's dependencies.

```typescript
import bcrypt from 'bcryptjs';

// Hash a password
const hashedPassword = await bcrypt.hash('plain-text-password', 12);

// Verify a password
const isValid = await bcrypt.compare('plain-text-password', hashedPassword);
```

## Authorization

### Introduction

In addition to providing authentication services out of the box, NodeRex also provides a simple way to authorize user actions against a given resource. For example, even though a user is authenticated, they may not be authorized to update or delete certain Eloquent models or database records that have been created by other users.

### Creating Policies

Policies are classes that organize authorization logic around a particular model or resource. For example, if your application is a blog, you may have a `Post` model and a corresponding `PostPolicy` to authorize user actions such as creating or updating posts.

You may generate a policy using the `make:policy` Artisan command. The generated policy will be placed in the `src/app/Policies` directory:

```bash
npm run artisan make:policy PostPolicy
```

## Encryption

### Introduction

NodeRex's encryption services provide a simple, convenient interface for encrypting and decrypting text via OpenSSL. All of NodeRex's encrypted values are signed using a message authentication code (MAC) so that their underlying value can not be modified or tampered with once encrypted.

### Configuration

Before using NodeRex's encrypter, you must set a `key` option in your `src/config/app.ts` configuration file. You should use the `key:generate` Artisan command to generate this key since this Artisan command will use NodeRex's secure random key generator to build your key:

```bash
npm run artisan key:generate
```

## CSRF Protection

### Introduction

NodeRex makes it easy to protect your application from cross-site request forgery (CSRF) attacks. Cross-site request forgeries are a type of malicious exploit whereby unauthorized commands are performed on behalf of an authenticated user.

NodeRex automatically generates a CSRF "token" for each active user session managed by the application. This token is used to verify that the authenticated user is the one actually making the requests to the application.

## XSS Protection

### Introduction

Cross-site scripting (XSS) attacks are a type of injection attack in which malicious scripts are injected into otherwise trusted websites. NodeRex includes Helmet middleware which provides protection against XSS attacks.

## SQL Injection

### Introduction

SQL injection is a code injection technique used to attack data-driven applications, in which malicious SQL statements are inserted into an entry field for execution.

NodeRex's query builder and Eloquent ORM use parameterized queries, which protect against SQL injection. Always use the query builder or Eloquent ORM instead of raw SQL queries when possible.

## Mass Assignment

### Introduction

When creating a new model, you may pass an array of attributes to the model constructor. These attributes are then assigned to the model via mass assignment. This is convenient; however, can be a **serious** security concern when user input is blindly passed into the model, allowing the user to modify **any and all** of the model's attributes.

### Mass Assignment Protection

You may use the `fill` method to fill the model with an array of attributes. The `fill` method will only set attributes that exist on the model:

```typescript
const user = new User();
user.fill(request.all()); // Only fills attributes that exist on User model
await user.save();
```

## Rate Limiting

### Introduction

NodeRex includes rate limiting middleware to help mitigate brute-force attacks against your application's authentication system. Rate limiting is configured in your `src/config/app.ts` file:

```typescript
rateLimit: {
  windowMs: 900000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
}
```

## Next Steps

Now that you've learned about security, you may want to explore:

- **[Authentication](#authentication)** - Implementing user authentication
- **[Authorization](#authorization)** - User authorization and policies
- **[Encryption](#encryption)** - Encrypting sensitive data
