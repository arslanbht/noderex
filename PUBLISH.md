# Publishing NodeRex Framework

This guide explains how to publish the NodeRex framework to npm so others can use it.

## Pre-Publication Checklist

### 1. Update Package Information

Before publishing, update the following in `package.json`:

```json
{
  "author": "Your Name <your.email@example.com>",
  "repository": {
    "type": "git",
    "url": "https://github.com/your-username/noderex.git"
  },
  "bugs": {
    "url": "https://github.com/your-username/noderex/issues"
  },
  "homepage": "https://github.com/your-username/noderex#readme"
}
```

### 2. Test the Framework

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Test project creation:**
   ```bash
   npx ts-node src/cli/create-project.ts test-project --skip-install
   cd test-project
   npm install
   npm run dev
   ```

3. **Test Artisan CLI:**
   ```bash
   npx ts-node src/cli/artisan.ts --help
   npx ts-node src/cli/artisan.ts make:controller TestController
   ```

### 3. Create GitHub Repository

1. Create a new repository on GitHub
2. Update the repository URLs in `package.json`
3. Push your code:
   ```bash
   git add .
   git commit -m "Initial commit: NodeRex framework v1.0.0"
   git push origin main
   ```

## Publishing to npm

### 1. Create npm Account

If you don't have an npm account:
1. Go to [npmjs.com](https://www.npmjs.com)
2. Sign up for a free account
3. Verify your email

### 2. Login to npm

```bash
npm login
```

Enter your npm username, password, and email.

### 3. Check Package Name Availability

```bash
npm view noderex
```

If the package name is taken, choose a different name like `@your-username/noderex` or `noderex-framework`.

### 4. Update Package Name (if needed)

```bash
npm view your-chosen-name
```

If available, update `package.json`:
```json
{
  "name": "your-chosen-name"
}
```

### 5. Build and Publish

```bash
npm run build
npm publish
```

## Post-Publication

### 1. Test the Published Package

Create a new project using the published package:

```bash
npx your-package-name my-test-app
cd my-test-app
npm install
npm run dev
```

### 2. Update Documentation

Update the README with the correct package name and installation instructions.

### 3. Create Release Notes

Create a GitHub release with:
- Version number
- New features
- Breaking changes
- Bug fixes

## Usage After Publication

Users can now create NodeRex projects with:

```bash
# Create a new project
npx your-package-name my-awesome-app

# Navigate to project
cd my-awesome-app

# Start development server
npm run dev
```

## Updating the Package

When you make changes:

1. Update version in `package.json`:
   ```bash
   npm version patch  # for bug fixes
   npm version minor  # for new features
   npm version major  # for breaking changes
   ```

2. Build and publish:
   ```bash
   npm run build
   npm publish
   ```

3. Push to GitHub:
   ```bash
   git push --tags
   ```

## Package Features

The published package includes:

- **Framework Core**: All MVC components, routing, validation
- **CLI Tools**: Project creation and Artisan commands
- **TypeScript Support**: Full type definitions
- **Documentation**: README and examples
- **Templates**: Project scaffolding
- **Git Integration**: Comprehensive .gitignore files

## Support

- GitHub Issues: For bug reports and feature requests
- Documentation: README.md and inline code comments
- Examples: Created projects serve as examples

## License

The package is published under the MIT License, allowing free use in both open-source and commercial projects.
