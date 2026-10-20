# resumable-rx-resource

An npm-workspace Nx repository containing one publishable Angular library:
`packages/resumable-rx-resource`.

The library currently contains the generated standalone component and a Vitest
smoke test. The resumable-resource API is not implemented yet.

## Prerequisites

- Node.js 24.15 or newer within the Node 24 release line is recommended.
  Angular also supports Node `^22.22.3` and `>=26.0.0`.
- npm, Git, and a clean working tree when creating a release.

The development toolchain uses Angular 22.2.3, TypeScript 6.0, and Nx 23.2.0.
Angular is a peer dependency of the published library; local framework and
compiler packages are development dependencies of the private repository root.

## Development

```bash
npm ci
npm run build
npm test
npm run lint
```

Run all verification targets together:

```bash
npx nx run-many -t lint test build --projects=resumable-rx-resource
```

The production build performs Angular compilation and template type checking.
Tests use Angular's native Vitest integration and run without watch mode.
There are no separate application, e2e, or TypeScript-solution projects.

## Package Layout

- `packages/resumable-rx-resource/src/index.ts`: public source entry point.
- `packages/resumable-rx-resource/ng-package.json`: Angular package build settings.
- `packages/resumable-rx-resource/project.json`: Nx build, test, and release settings.
- `dist/packages/resumable-rx-resource`: publishable Angular Package Format output.

The root `@org/source` project is private infrastructure, not an npm release
candidate. Its existing `local-registry` target remains available for Verdaccio.

## Validate The Archive

Build first, then inspect the output directory:

```bash
npm run build
cd dist/packages/resumable-rx-resource
npm pack --dry-run --json
npm publish --dry-run --ignore-scripts --registry=https://registry.npmjs.org/
```

The archive must contain the package manifest, README, ES module bundles, and
type declarations. Do not publish the source workspace directory.

## Release To npm

The intended public npm name is `resumable-rx-resource`, initially at `0.0.1`.
Before publishing, verify that your npm account can publish that name, authenticate
with npm, and satisfy npm's 2FA requirements. No credentials belong in this repo.

From the repository root, preview the first release without creating files,
commits, tags, or an npm publication:

```bash
npx nx release 0.0.1 --first-release --dry-run --skip-publish
```

After reviewing the preview, create and publish the first release:

```bash
npx nx release 0.0.1 --first-release
```

Subsequent releases use the Git release tag as the current-version source:

```bash
npx nx release patch --dry-run --skip-publish
npx nx release patch
```

Nx Release selects only `resumable-rx-resource`. It builds before versioning,
then updates and publishes the manifest in `dist/packages/resumable-rx-resource`.
The source manifest's seed version is not the authoritative version after a
release. Do not rebuild between release versioning and publication: rebuilding
would overwrite the versioned artifact. Preserve and push release commits/tags
according to your repository workflow.

For a release already versioned by Nx, publish the existing artifact without
rebuilding:

```bash
npx nx release publish --projects=resumable-rx-resource
```

CI checks formatting, lint, tests, and production packaging. Publishing is a
manual workflow; no automatic npm publication is configured.
