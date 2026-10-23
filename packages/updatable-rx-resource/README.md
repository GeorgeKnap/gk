# updatable-rx-resource

Angular's `rxResource` API with local value edits that keep the source stream alive.

Native `rxResource` switches to `local` state and cancels its current subscription
when you write to its value. `updatableRxResource` instead writes to a separate
`linkedSignal`. The native resource keeps receiving observable emissions, and the
next emission replaces the local edit.

The package exports only `updatableRxResource`. Resource and option types remain
available from Angular; there is no component, custom options type, or resume method.

## Installation And Requirements

Once published to npm:

```bash
npm install @gk/updatable-rx-resource
```

Requires Angular `^22.2.3` and RxJS `^7.8.2`. Both are external peer dependencies,
not bundled copies. The package uses Angular 22's resource and linked-signal APIs;
support for earlier Angular versions is not claimed.

## A Live Stream With Local Edits

Create the resource in an Angular injection context, such as a service field:

```typescript
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { updatableRxResource } from '@gk/updatable-rx-resource';

@Injectable({ providedIn: 'root' })
export class CounterStore {
  private readonly source = new BehaviorSubject({ count: 0 });

  readonly counter = updatableRxResource({
    stream: () => this.source,
    defaultValue: { count: 0 },
  });

  incrementLocally(): void {
    this.counter.update((current) => ({
      ...current,
      count: current.count + 1,
    }));
  }

  receiveServerCount(count: number): void {
    this.source.next({ count });
  }
}
```

After the resource starts, a source count of `1` is visible as `resolved`.
`incrementLocally()` displays `2` with status `local`, without unsubscribing.
`receiveServerCount(3)` then displays `3` with status `resolved`, using that same
subscription. No reload is required to receive the next source event.

All four native write entry points use the same local-only path:

```typescript
store.counter.value.set({ count: 10 });
store.counter.value.update((current) => ({ count: current.count + 1 }));
store.counter.set({ count: 20 });
store.counter.update((current) => ({ count: current.count + 1 }));
```

These are alternative calls on an injected `CounterStore` instance named `store`.
Use immutable updates. Mutating an object in place is not a signal write and may
not notify consumers. The wrapper does not save local edits to a server or merge
them with future source values; the source wins on its next emission.

## Reactive Parameters And HTTP

Options use Angular's current `params`/`stream` API:

```typescript
import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { updatableRxResource } from '@gk/updatable-rx-resource';

interface User {
  id: number;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class UserStore {
  private readonly http = inject(HttpClient);
  readonly userId = signal<number | undefined>(1);

  readonly user = updatableRxResource({
    params: () => this.userId(),
    stream: ({ params: id }) => this.http.get<User>(`/api/users/${id}`),
  });

  renameLocally(name: string): void {
    if (this.user.hasValue()) {
      this.user.update((current) => ({ ...current, name }));
    }
  }
}
```

Configure `provideHttpClient()` in the consuming application. Inside `stream`,
`id` is a `number`: Angular does not call the loader for undefined params.
Changing `userId` starts a native request and clears a local edit. Setting it to
`undefined` makes the resource `idle`; its value returns to the configured default
or `undefined`, and stale source events cannot replace that idle value.

HTTP observables normally complete after one response. A local edit after
completion remains local until a parameter change or successful reload produces
new data. Editing does not reconnect a completed observable.

The params callback also receives Angular's `ResourceParamsContext`, so
`params: ({ chain }) => chain(otherResource)` works with native resource chaining.

## Defaults And Type Inference

The function has the same overloads as `rxResource`:

```typescript
import type { ResourceRef } from '@angular/core';
import type { RxResourceOptions } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { updatableRxResource } from '@gk/updatable-rx-resource';

// Within an injection context:
const optional = updatableRxResource({ stream: () => of(1) });
// ResourceRef<number | undefined>

const required = updatableRxResource({
  stream: () => of(1),
  defaultValue: 0,
});
// ResourceRef<number>
```

The type imports illustrate where Angular's types live; the inferred variables
need no explicit annotations. `defaultValue` does not widen the inferred stream
type. If `T` itself includes `undefined`, a default does not remove it from `T`.
Use an explicitly typed observable or both generic arguments when a source such
as `NEVER` cannot infer the intended value type.

Defaults apply while initially loading, when new params load, and in idle or
destroyed state. Reloads retain the last native source value, not a local edit.

## Resource API

The returned object is an Angular `ResourceRef<T>` or `ResourceRef<T | undefined>`:

| Member                            | Behavior                                                               |
| --------------------------------- | ---------------------------------------------------------------------- |
| `value()`                         | Read the public linked value; throws in error state.                   |
| `value.set(value)` / `set(value)` | Write locally without touching the native resource.                    |
| `value.update(fn)` / `update(fn)` | Update from the current public value without tracking that value read. |
| `status()`                        | `idle`, `loading`, `reloading`, `resolved`, `error`, or `local`.       |
| `error()`                         | The native error, or `undefined` while locally overridden.             |
| `isLoading()`                     | True for public `loading` and `reloading` states.                      |
| `snapshot()`                      | A discriminated status/value or status/error snapshot.                 |
| `hasValue()`                      | Reactive check and type guard excluding `undefined`; false on error.   |
| `asReadonly()`                    | A live resource view typed without write/reload methods.               |
| `value.asReadonly()`              | A live readonly signal view of the linked value.                       |
| `reload()`                        | Delegate to Angular and return whether a reload was initiated.         |
| `destroy()`                       | Cancel native work, clear the overlay, and return to idle/default.     |

Local writes set public status to `local`, clear the public error, and make
`isLoading()` false. The underlying stream or first load may still be active.
Writing `undefined` is allowed when the resource type permits it, but makes
`hasValue()` false even though status is `local`.

`asReadonly()` provides type-level restrictions, as native Angular does; it is not
a security boundary or a frozen object. `value.asReadonly()` returns a signal
without writable methods. Neither view deep-freezes objects.

## Errors And Rendering

Read the snapshot or use `hasValue()` before accessing values that may be absent
or errored. For an injected `UserStore` instance named `store`:

```typescript
const state = store.user.snapshot();
if (state.status === 'error') {
  console.error(state.error.message);
} else if (store.user.hasValue()) {
  console.log(store.user.value().name);
}
```

`value()` throws in the native error state; `snapshot()` and `error()` are safe
ways to inspect it. `set()` can replace the error with a local value. `update()`
first reads the current value and therefore throws while errored; its updater is
not called. An observable error is terminal: a local write does not resubscribe,
retry, or recover the source. Use native reload/parameter changes or RxJS retry
operators when that is appropriate.

An observable that completes without any value still produces Angular's
`NG0991` resource error. Returning `EMPTY` from `catchError` does not provide a
successful value; emit an appropriate fallback when one is intended.

## Equality And Repeated Emissions

Pass `equal` exactly as you would to `rxResource`, for example:

```typescript
const resource = updatableRxResource({
  stream: () => users$,
  equal: (previous, next) => previous.id === next.id,
});
```

Here `users$` is an `Observable<User>` and creation occurs in an injection context.
Equality applies to source values through Angular and to local linked-value
notifications. The comparator is not called with implicit `undefined` values or
internal error state.

Every active source emission ends a local override, even a repeated primitive,
the same object reference, or a value considered equal by `equal`. Equality can
still retain an equivalent existing object and suppress value notifications.
Consequently, an emission may change `status()` from `local` to `resolved` without
notifying consumers of `value()`. Do not ignore object fields in `equal` when
those fields need to trigger rendering.

## Reloads And Lifecycle Differences

The API matches native `rxResource`, but preserving its subscription intentionally
changes local-write behavior:

| Scenario                               | Native `rxResource`                              | `updatableRxResource`                                                                |
| -------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------ |
| Local write during a live stream       | Enters local state and cancels the subscription. | Enters public local state; the subscription stays active.                            |
| Next event from that stream            | No longer received after cancellation.           | Replaces the local overlay and resumes native presentation.                          |
| Local write during initial loading     | Cancels the native load.                         | Native work and pending tasks continue, even though public loading is false.         |
| Reload after that initial-loading edit | Native local state can accept a reload.          | Native loading state can still reject it with `false`.                               |
| Reload after a resolved-stream edit    | Starts from native local state.                  | Starts from native resolved state and retains the last source value while reloading. |
| Loader's `previous.status`             | Reflects native state, including local writes.   | Reflects untouched native state, not the public local overlay.                       |

The wrapper delegates cancellation timing to Angular. Undefined params change
public state to idle immediately; they are not a guarantee of immediate teardown
of an already resolved stream. A replacement load or destruction cancels remaining
native work. Local edits never drive cancellation.

Because native pending tasks remain active, setting a local value during the first
load does not make an unresolved source stable for tests or SSR. Do not use a
local write to unblock a source that never emits.

## Injection And Cleanup

Without `injector`, creation requires an Angular injection context. To create a
resource elsewhere, pass an injector explicitly:

```typescript
import type { Injector, ResourceRef } from '@angular/core';
import type { Observable } from 'rxjs';
import { updatableRxResource } from '@gk/updatable-rx-resource';

export function createCounterResource(
  injector: Injector,
  source: Observable<number>,
): ResourceRef<number> {
  return updatableRxResource({
    injector,
    stream: () => source,
    defaultValue: 0,
  });
}
```

The injector owns the resource lifetime. Injector destruction cancels native work
and clears local state. Call `destroy()` to release the resource earlier; it is
idempotent. After destruction, writes have no effect, reload returns false, and
the value is the default or `undefined`.

The stream callback receives the native `abortSignal`. Use it for additional
work associated with the load when necessary; observable subscription teardown
itself is managed by Angular.

## SSR And Other Options

All native options are accepted: `stream`, `params`, `defaultValue`, `equal`,
`injector`, and `id`. An SSR `id` is forwarded unchanged to Angular; it must match
on the server and client. The wrapper adds no transfer cache, persistence, or SSR
hydration mechanism of its own. SSR behavior beyond native forwarding is not
separately integration-tested by this package.

This is not an automatic retry, reconnection, offline persistence, or optimistic
writeback library. It only prevents local edits from stopping a live resource.

## Development

From the repository root:

```bash
npm ci
npx nx run-many -t lint test build --projects=updatable-rx-resource
```

Production builds emit Angular Package Format bundles and declarations to
`dist/packages/updatable-rx-resource`. Publish that output, not the source directory.
See the repository's root README for the manual Nx Release workflow.

## License

MIT
