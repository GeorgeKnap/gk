# updatable-rx-resource

An npm-workspace Nx repository containing one publishable Angular library:
`packages/updatable-rx-resource`, published as `@geetium/updatable-rx-resource`.

The package exports `updatableRxResource`, a wrapper for Angular's `rxResource`
whose local value writes do not cancel its observable subscription. A writable
`linkedSignal` holds local edits until the next source emission or resource reset.

See the [usage guide](packages/updatable-rx-resource/README.md) for examples, API
details, equality behavior, and differences from native resource state.

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
npx nx run-many -t lint test build --projects=updatable-rx-resource
```

The production build performs Angular compilation and template type checking.
Tests use Angular's native Vitest integration and run without watch mode.
There are no separate application, e2e, or TypeScript-solution projects.

## Package Layout

- `packages/updatable-rx-resource/src/index.ts`: public source entry point.
- `packages/updatable-rx-resource/ng-package.json`: Angular package build settings.
- `packages/updatable-rx-resource/project.json`: Nx build, test, and release settings.
- `dist/packages/updatable-rx-resource`: publishable Angular Package Format output.

## Validate The Archive

Build first, then inspect the output directory:

```bash
npm run build
cd dist/packages/updatable-rx-resource
npm pack --dry-run --json
npm publish --dry-run --ignore-scripts --registry=https://registry.npmjs.org/
```

The archive must contain the package manifest, README, ES module bundles, and
type declarations. Do not publish the source workspace directory.

## Release To npm

The public npm name is `@geetium/updatable-rx-resource`, first published at `0.0.1`.
Publishing requires an npm account with write access to the `geetium` organization
and npm's 2FA. No credentials belong in this repo.

The account uses a security key or passkey for 2FA. `nx release` runs `npm publish`
non-interactively, so it cannot complete that browser check and reports a missing
OTP. Version with Nx, then publish the built artifact with npm:

```bash
npx nx release patch --dry-run --skip-publish
npx nx release patch --skip-publish
npm publish ./dist/packages/updatable-rx-resource --access public
git push origin main --follow-tags
```

Replace `patch` with `minor`, `major`, or an exact version as needed.
`npm publish` prompts for the security-key confirmation in the browser.

Nx Release selects only `updatable-rx-resource`. It builds before versioning,
then updates the manifest in `dist/packages/updatable-rx-resource`. The current
version comes from the latest `v*` Git tag, so push release tags. The source
manifest's version is not authoritative after a release. Do not rebuild between
versioning and `npm publish`: rebuilding would overwrite the versioned artifact.

With an authenticator-app OTP or an npm granular token that bypasses 2FA,
`npx nx release patch` can publish directly. Retry only a failed publish with
`npx nx release publish --projects=updatable-rx-resource --otp=<code>`.

CI checks formatting, lint, tests, and production packaging. Publishing is a
manual workflow; no automatic npm publication is configured.
