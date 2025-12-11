# Installation

## Server Requirements

NodeRex has a few system requirements. Before installing NodeRex, make sure your server meets the following requirements:

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0 (or yarn/pnpm)
- **TypeScript** >= 5.0.0 (installed as dev dependency)

## Installing NodeRex

### Via NPM

You may install NodeRex by issuing the Composer create-project command in your terminal:

```bash
npm install noderex express typeorm reflect-metadata
npm install -D typescript ts-node @types/node @types/express
```

### Via Create Project Command

Alternatively, you may use the NodeRex installer to create a new NodeRex project:

```bash
npx noderex my-app
cd my-app
npm install
```

This command will create a new `my-app` directory containing a fresh NodeRex installation with all dependencies.

## Configuration

### Environment Configuration

After installing NodeRex, you should configure your environment. A `.env.example` file is included in the root of all NodeRex projects. You may copy this file and rename it to `.env`:

```bash
cp .env.example .env
```

### Application Key

Next, you should set your application key. This key is used to encrypt data and should be set to a random 32-character string. You may generate a key using the Artisan command:

```bash
npm run artisan key:generate
```

Or manually set it in your `.env` file:

```env
APP_KEY=base64:your-random-32-character-string-here
```

### Additional Configuration

You may also want to review the other configuration options in the `src/config` directory:

- `app.ts` - Application configuration
- `database.ts` - Database configuration

## Directory Structure

After installing NodeRex, your application's directory structure will look similar to this:

```
my-app/
├── src/
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/     # Application controllers
│   │   │   ├── Requests/        # Form request classes
│   │   │   └── Resources/       # API resource classes
│   │   ├── Models/              # Eloquent models
│   │   └── Middleware/          # HTTP middleware
│   ├── config/                   # Configuration files
│   ├── database/
│   │   ├── migrations/          # Database migrations
│   │   └── seeders/             # Database seeders
│   └── routes/                   # Route definitions
├── .env                          # Environment configuration
├── package.json
└── tsconfig.json
```

## Web Server Configuration

### Development Server

During development, you may use NodeRex's built-in development server:

```bash
npm run dev
```

The development server will start on `http://localhost:3000` by default.

### Production Server

For production, you should use a process manager like PM2:

```bash
npm run build
pm2 start dist/index.js --name my-app
```

## Next Steps

Now that you have NodeRex installed, you're ready to learn the basics:

- **[Routing](BASICS.md#routing)** - Define your application's routes
- **[Controllers](BASICS.md#controllers)** - Handle HTTP requests
- **[Models](ELOQUENT.md#models)** - Work with your database
- **[Migrations](DATABASE.md#migrations)** - Manage your database schema
