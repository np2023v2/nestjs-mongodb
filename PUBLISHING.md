# Publishing Guide

This guide explains how to publish the `@np2023v2/nestjs-mongodb` package to npm.

## Prerequisites

1. **npm Account**: You need an npm account. Create one at [npmjs.com](https://www.npmjs.com/signup)
2. **npm Organization**: You need access to the `@np2023v2` organization on npm, or change the package name in `package.json` to use your own scope
3. **npm Login**: Login to npm from your terminal

```bash
npm login
```

## Pre-Publishing Checklist

Before publishing, ensure:

- [ ] All tests pass: `npm test`
- [ ] Code builds successfully: `npm run build`
- [ ] Version number is updated in `package.json` (follow [Semantic Versioning](https://semver.org/))
- [ ] `CHANGELOG.md` is updated with changes for the new version
- [ ] All changes are committed to git
- [ ] You have pushed the latest changes to GitHub

## Publishing Steps

### 1. Update Version

Update the version in `package.json` following semantic versioning:

- **Patch** (1.0.0 → 1.0.1): Bug fixes
- **Minor** (1.0.0 → 1.1.0): New features (backwards compatible)
- **Major** (1.0.0 → 2.0.0): Breaking changes

Or use npm version command:

```bash
# For patch update
npm version patch

# For minor update
npm version minor

# For major update
npm version major
```

### 2. Build and Test

The `prepublishOnly` script will automatically run build and tests before publishing, but it's good practice to verify first:

```bash
npm run build
npm test
```

### 3. Test the Package Locally (Optional but Recommended)

Create a test package:

```bash
npm pack
```

This creates a `.tgz` file. Test it in another project:

```bash
cd /path/to/test-project
npm install /path/to/nestjs-mongodb/np2023v2-nestjs-mongodb-<version>.tgz
```

### 4. Publish to npm

For the first publish or for a public package:

```bash
npm publish --access public
```

For subsequent publishes (if already public):

```bash
npm publish
```

### 5. Verify Publication

Check that the package is available:

```bash
npm view @np2023v2/nestjs-mongodb
```

Or visit: https://www.npmjs.com/package/@np2023v2/nestjs-mongodb

### 6. Tag the Release in Git

Tag the release in git:

```bash
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

## Publishing Scoped Packages

Since this is a scoped package (`@np2023v2/nestjs-mongodb`), you need to:

1. Have access to the `@np2023v2` organization on npm, OR
2. Change the package name in `package.json` to use your own scope/organization

If you want to create your own organization:
- Go to https://www.npmjs.com/org/create
- Create an organization (free for public packages)
- Update the package name in `package.json` to use your organization scope

## Troubleshooting

### Error: You do not have permission to publish

This means you don't have access to the `@np2023v2` organization. Either:
- Get added to the organization by the owner
- Change the package name to use your own scope

### Error: Package already exists

If the package version already exists on npm, you need to bump the version number.

### Error: prepublishOnly script failed

This means either the build or tests failed. Fix the issues before publishing:

```bash
npm run build
npm test
```

## Unpublishing (Not Recommended)

If you need to unpublish a version (only within 72 hours):

```bash
npm unpublish @np2023v2/nestjs-mongodb@<version>
```

**Note**: Unpublishing is discouraged as it breaks dependent projects. Use `npm deprecate` instead:

```bash
npm deprecate @np2023v2/nestjs-mongodb@<version> "Reason for deprecation"
```

## Useful Commands

```bash
# Check package contents before publishing
npm pack --dry-run

# View published package info
npm view @np2023v2/nestjs-mongodb

# View all published versions
npm view @np2023v2/nestjs-mongodb versions

# Check who can publish to the package
npm owner ls @np2023v2/nestjs-mongodb

# Add a collaborator
npm owner add <username> @np2023v2/nestjs-mongodb
```
