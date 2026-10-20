# resumable-rx-resource

An Angular library scaffold for resumable RxJS resources, built with Nx and ng-packagr.

The package currently exports only the generated standalone `ResumableRxResource`
component. The resumable-resource API is not implemented yet.

## Requirements

- Angular 22.2.3 or a newer compatible Angular 22 release.
- An Angular application with its normal Angular and RxJS dependencies installed.

## Installation

After the first npm publication:

```bash
npm install resumable-rx-resource
```

Angular is a peer dependency and is not bundled with the library.

## Development

From the repository root:

```bash
npm ci
npx nx build resumable-rx-resource
npx nx test resumable-rx-resource
npx nx lint resumable-rx-resource
```

Production builds use partial Angular compilation and emit Angular Package Format
bundles and type declarations to `dist/packages/resumable-rx-resource`.

Release instructions are in the repository's root README. Publish the built
package, not this source directory.

## License

MIT
