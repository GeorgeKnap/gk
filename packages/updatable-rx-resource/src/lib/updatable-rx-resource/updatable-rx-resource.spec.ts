import {
  computed,
  createEnvironmentInjector,
  effect,
  EnvironmentInjector,
  Injector,
  isSignal,
  type Resource,
  type ResourceRef,
  type Signal,
  signal,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { TestBed } from '@angular/core/testing';
import { EMPTY, NEVER, Observable, of, Subject, throwError } from 'rxjs';
import { updatableRxResource } from './updatable-rx-resource';

describe('updatableRxResource', () => {
  const writes: [string, (resource: ResourceRef<number>) => void][] = [
    ['value.set', (resource) => resource.value.set(2)],
    ['value.update', (resource) => resource.value.update(() => 2)],
    ['set', (resource) => resource.set(2)],
    ['update', (resource) => resource.update(() => 2)],
  ];

  it.each(writes)('keeps the source subscribed after %s', async (_, write) => {
    const events = new Subject<number>();
    const subscribed = vi.fn();
    const unsubscribed = vi.fn();
    let abortSignal: AbortSignal | undefined;
    const resource = TestBed.runInInjectionContext(() =>
      updatableRxResource({
        defaultValue: 0,
        stream: (params) => {
          abortSignal = params.abortSignal;
          return new Observable<number>((subscriber) => {
            subscribed();
            const subscription = events.subscribe(subscriber);
            return () => {
              subscription.unsubscribe();
              unsubscribed();
            };
          });
        },
      }),
    );
    TestBed.tick();
    events.next(1);
    await Promise.resolve();

    expect(resource.value()).toBe(1);
    write(resource);
    expect(resource.value()).toBe(2);
    expect(resource.status()).toBe('local');
    expect(resource.snapshot()).toEqual({ status: 'local', value: 2 });
    expect(abortSignal?.aborted).toBe(false);
    expect(unsubscribed).not.toHaveBeenCalled();

    events.next(3);
    expect(resource.value()).toBe(3);
    expect(resource.status()).toBe('resolved');
    expect(subscribed).toHaveBeenCalledTimes(1);
    expect(unsubscribed).not.toHaveBeenCalled();
    resource.destroy();
    expect(unsubscribed).toHaveBeenCalledTimes(1);
  });

  it('exposes only the function from the public entry', async () => {
    const entry = await import('../../index');
    expect(Object.keys(entry)).toEqual(['updatableRxResource']);
  });

  it('uses a real writable signal and preserves updates before the first emission', async () => {
    const events = new Subject<number>();
    const resource = TestBed.runInInjectionContext(() =>
      updatableRxResource({ stream: () => events }),
    );
    expect(isSignal(resource.value)).toBe(true);
    expect(resource.value()).toBeUndefined();
    expect(resource.status()).toBe('loading');
    expect(resource.isLoading()).toBe(true);
    expect(resource.hasValue()).toBe(false);
    TestBed.tick();
    resource.set(10);
    expect(resource.value()).toBe(10);
    expect(resource.status()).toBe('local');
    expect(resource.isLoading()).toBe(false);
    expect(resource.reload()).toBe(false);
    events.next(20);
    await Promise.resolve();
    expect(resource.value()).toBe(20);
    expect(resource.status()).toBe('resolved');
    expect(resource.hasValue()).toBe(true);
  });

  it('supports synchronous sources and retains local edits after completion', () => {
    const resource = TestBed.runInInjectionContext(() =>
      updatableRxResource({ stream: () => of(1, 2) }),
    );
    TestBed.tick();
    expect(resource.value()).toBe(2);
    resource.update((value) => (value ?? 0) + 1);
    TestBed.tick();
    expect(resource.value()).toBe(3);
    expect(resource.status()).toBe('local');
  });

  it('resets a local edit on an identical source emission', async () => {
    const events = new Subject<number>();
    const resource = TestBed.runInInjectionContext(() =>
      updatableRxResource({ stream: () => events, defaultValue: 0 }),
    );
    TestBed.tick();
    events.next(1);
    await Promise.resolve();
    expect(resource.value()).toBe(1);
    resource.set(2);
    events.next(1);
    expect(resource.value()).toBe(1);
    expect(resource.status()).toBe('resolved');
  });

  it('resets local status even when the next emission equals the edited value', async () => {
    const events = new Subject<number>();
    const resource = TestBed.runInInjectionContext(() =>
      updatableRxResource({ stream: () => events }),
    );
    TestBed.tick();
    events.next(1);
    await Promise.resolve();
    resource.set(2);
    events.next(2);
    expect(resource.status()).toBe('resolved');
    expect(resource.value()).toBe(2);
  });

  it('honors equality without feeding undefined or errors into the comparator', async () => {
    const events = new Subject<{ id: number; label: string }>();
    const equal = vi.fn((previous: { id: number }, next: { id: number }) => {
      expect(previous).toBeTypeOf('object');
      expect(next).toBeTypeOf('object');
      return previous.id === next.id;
    });
    const resource = TestBed.runInInjectionContext(() =>
      updatableRxResource({ stream: () => events, equal }),
    );
    TestBed.tick();
    const first = { id: 1, label: 'first' };
    events.next(first);
    await Promise.resolve();
    expect(resource.value()).toBe(first);
    resource.set({ id: 2, label: 'local' });
    events.next({ id: 1, label: 'equal source' });
    expect(resource.status()).toBe('resolved');
    expect(resource.value()).toBe(first);
    resource.set(undefined);
    expect(resource.hasValue()).toBe(false);
    events.error(new Error('failed'));
    expect(resource.value).toThrow();
    resource.set({ id: 3, label: 'recovery' });
    expect(resource.value()?.id).toBe(3);
    expect(resource.error()).toBeUndefined();
  });

  it('restores the native value when an emission compares equal to the local override', async () => {
    const events = new Subject<{ id: number; label: string }>();
    const equal = (previous: { id: number }, next: { id: number }) =>
      previous.id === next.id;
    const subscribed = vi.fn();
    const unsubscribed = vi.fn();
    const resource = TestBed.runInInjectionContext(() =>
      updatableRxResource({
        stream: () =>
          new Observable<{ id: number; label: string }>((subscriber) => {
            subscribed();
            const subscription = events.subscribe(subscriber);
            return () => {
              subscription.unsubscribe();
              unsubscribed();
            };
          }),
        equal,
      }),
    );
    const first = { id: 1, label: 'server' };
    const local = { id: 1, label: 'local' };
    TestBed.tick();
    events.next(first);
    await Promise.resolve();
    expect(resource.value()).toBe(first);

    resource.set({ id: 2, label: 'intermediate local' });
    resource.set(local);
    expect(resource.value()).toBe(local);
    events.next({ id: 1, label: 'new server value' });

    expect(resource.status()).toBe('resolved');
    expect(resource.value()).toBe(first);
    expect(resource.snapshot()).toEqual({ status: 'resolved', value: first });
    expect(resource.hasValue()).toBe(true);
    expect(subscribed).toHaveBeenCalledTimes(1);
    expect(unsubscribed).not.toHaveBeenCalled();
    resource.destroy();
    expect(unsubscribed).toHaveBeenCalledTimes(1);
  });

  it('restores native errors, permits set recovery, and preserves update-on-error throwing', async () => {
    const events = new Subject<number>();
    const resource = TestBed.runInInjectionContext(() =>
      updatableRxResource({ stream: () => events, defaultValue: 0 }),
    );
    TestBed.tick();
    events.next(1);
    await Promise.resolve();
    resource.set(2);
    const failure = new Error('stream failed');
    events.error(failure);
    expect(resource.status()).toBe('error');
    expect(resource.error()).toBe(failure);
    expect(resource.snapshot()).toEqual({ status: 'error', error: failure });
    expect(resource.hasValue()).toBe(false);
    expect(resource.value).toThrow();
    const updater = vi.fn(() => 3);
    expect(() => resource.update(updater)).toThrow();
    expect(updater).not.toHaveBeenCalled();
    resource.value.set(4);
    expect(resource.error()).toBeUndefined();
    expect(resource.snapshot()).toEqual({ status: 'local', value: 4 });
    resource.update((current) => current + 1);
    expect(resource.value()).toBe(5);
  });

  it.each([
    ['empty completion', () => EMPTY],
    ['observable failure', () => throwError(() => 'failed')],
    [
      'factory failure',
      () => {
        throw new Error('factory failed');
      },
    ],
  ])('preserves native %s behavior', (_, stream) => {
    const resource = TestBed.runInInjectionContext(() =>
      updatableRxResource({ stream }),
    );
    TestBed.tick();
    expect(resource.status()).toBe('error');
    expect(resource.error()).toBeInstanceOf(Error);
    expect(resource.value).toThrow();
    expect(resource.snapshot().status).toBe('error');
  });

  it('uses defaults and supports local undefined without claiming a defined value', () => {
    const resource = TestBed.runInInjectionContext(() =>
      updatableRxResource<number | undefined, undefined>({
        params: () => undefined,
        stream: () => NEVER,
        defaultValue: 5,
      }),
    );
    expect(resource.status()).toBe('idle');
    expect(resource.value()).toBe(5);
    expect(resource.hasValue()).toBe(true);
    expect(resource.reload()).toBe(false);
    resource.set(undefined);
    expect(resource.status()).toBe('local');
    expect(resource.hasValue()).toBe(false);
    expect(resource.snapshot()).toEqual({ status: 'local', value: undefined });
  });

  it('reloads the native source without giving its loader the facade local status', () => {
    const previousStatuses: string[] = [];
    const resource = TestBed.runInInjectionContext(() =>
      updatableRxResource({
        defaultValue: 0,
        stream: ({ previous }) => {
          previousStatuses.push(previous.status);
          return of(previousStatuses.length);
        },
      }),
    );
    TestBed.tick();
    resource.set(9);
    expect(resource.reload()).toBe(true);
    expect(resource.status()).toBe('reloading');
    expect(resource.value()).toBe(1);
    TestBed.tick();
    expect(previousStatuses).toEqual(['idle', 'resolved']);
    expect(resource.value()).toBe(2);
  });

  it('cancels old sources on parameter changes and resets to the default', async () => {
    const params = signal<number | undefined>(1);
    const streams = new Map<number, Subject<number>>();
    const abortSignals: AbortSignal[] = [];
    const resource = TestBed.runInInjectionContext(() =>
      updatableRxResource({
        params,
        defaultValue: 0,
        stream: (request) => {
          abortSignals.push(request.abortSignal);
          const stream = new Subject<number>();
          streams.set(request.params, stream);
          return stream;
        },
      }),
    );
    TestBed.tick();
    streams.get(1)?.next(1);
    await Promise.resolve();
    resource.set(9);
    params.set(2);
    expect(resource.status()).toBe('loading');
    expect(resource.value()).toBe(0);
    TestBed.tick();
    expect(abortSignals[0].aborted).toBe(true);
    streams.get(1)?.next(100);
    streams.get(2)?.next(2);
    await Promise.resolve();
    expect(resource.value()).toBe(2);
    params.set(undefined);
    expect(resource.status()).toBe('idle');
    TestBed.tick();
    streams.get(2)?.next(100);
    expect(resource.value()).toBe(0);
    resource.destroy();
    expect(abortSignals[1].aborted).toBe(true);
  });

  it('clears a local override when parameters change during initial loading', () => {
    const params = signal(1);
    const resource = TestBed.runInInjectionContext(() =>
      updatableRxResource({
        params,
        stream: (): Observable<number> => NEVER,
        defaultValue: 0,
      }),
    );
    TestBed.tick();
    resource.set(9);
    params.set(2);
    expect(resource.status()).toBe('loading');
    expect(resource.value()).toBe(0);
  });

  it('provides reactive readonly views and hasValue', async () => {
    const events = new Subject<number>();
    const resource = TestBed.runInInjectionContext(() =>
      updatableRxResource({ stream: () => events }),
    );
      const readonlyResource: Resource<number | undefined> =
        resource.asReadonly();
    const readonlyValue = resource.value.asReadonly();
    const defined = computed(() => readonlyResource.hasValue());
    expect('set' in readonlyValue).toBe(false);
    expect(defined()).toBe(false);
    TestBed.tick();
    events.next(1);
    await Promise.resolve();
    expect(defined()).toBe(true);
    expect(readonlyValue()).toBe(1);
    resource.set(2);
    expect(readonlyResource.snapshot()).toEqual({ status: 'local', value: 2 });
    expect(readonlyValue()).toBe(2);
  });

  it('does not track the current value read by update', () => {
    const resource = TestBed.runInInjectionContext(() =>
      updatableRxResource({
        stream: (): Observable<number> => NEVER,
        defaultValue: 0,
      }),
    );
    const runs = vi.fn();
    TestBed.runInInjectionContext(() =>
      effect(() => {
        runs();
        resource.update((current) => current + 1);
      }),
    );
    TestBed.tick();
    resource.set(2);
    TestBed.tick();
    expect(runs).toHaveBeenCalledTimes(1);
  });

  it('supports an explicit injector outside an injection context', () => {
    const injector = TestBed.inject(Injector);
    const resource = updatableRxResource({ injector, stream: () => of(1) });
    TestBed.tick();
    expect(resource.value()).toBe(1);
  });

  it('requires an injection context when no injector is supplied', () => {
    expect(() => updatableRxResource({ stream: () => of(1) })).toThrow();
  });

  it('resets local state on explicit destruction and ignores subsequent writes', () => {
    const resource = TestBed.runInInjectionContext(() =>
      updatableRxResource({
        params: () => undefined,
        stream: (): Observable<number> => NEVER,
        defaultValue: 0,
      }),
    );
    resource.set(9);
    resource.destroy();
    resource.destroy();
    resource.value.set(10);
    resource.update(() => 11);
    expect(resource.snapshot()).toEqual({ status: 'idle', value: 0 });
    expect(resource.reload()).toBe(false);
  });

  it('destroys the wrapper with its injector and releases the active subscription', async () => {
    const injector = createEnvironmentInjector(
      [],
      TestBed.inject(EnvironmentInjector),
    );
    const events = new Subject<number>();
    let abortSignal: AbortSignal | undefined;
    const resource = updatableRxResource({
      injector,
      stream: (params) => {
        abortSignal = params.abortSignal;
        return events;
      },
      defaultValue: 0,
    });
    TestBed.tick();
    events.next(1);
    await Promise.resolve();
    resource.set(9);
    injector.destroy();
    expect(abortSignal?.aborted).toBe(true);
    events.next(100);
    resource.value.update(() => 200);
    expect(resource.snapshot()).toEqual({ status: 'idle', value: 0 });
  });

  it('clears local state on a repeated object reference and keeps the latest unread emission', async () => {
    const events = new Subject<{ id: number }>();
    const resource = TestBed.runInInjectionContext(() =>
      updatableRxResource({ stream: () => events }),
    );
    const first = { id: 1 };
    TestBed.tick();
    events.next(first);
    await Promise.resolve();
    resource.set({ id: 2 });
    events.next(first);
    expect(resource.value()).toBe(first);
    expect(resource.status()).toBe('resolved');
    resource.set({ id: 3 });
    events.next({ id: 4 });
    events.next({ id: 5 });
    expect(resource.value()).toEqual({ id: 5 });
  });

  it('passes the native params chaining context and narrows loader params', () => {
    const parent = TestBed.runInInjectionContext(() =>
      updatableRxResource({ stream: () => of(2) }),
    );
    const child = TestBed.runInInjectionContext(() =>
      updatableRxResource({
        params: ({ chain }) => chain(parent),
        stream: ({ params }) => {
          expectTypeOf(params).toEqualTypeOf<number>();
          return of(params * 2);
        },
      }),
    );
    TestBed.tick();
    expect(child.value()).toBe(4);
    parent.set(3);
    expect(child.status()).toBe('loading');
    TestBed.tick();
    expect(child.value()).toBe(6);
  });

  it('preserves parameter errors and resets local recovery on subsequent parameter changes', () => {
    const fails = signal(true);
    const failure = new Error('invalid params');
    const resource = TestBed.runInInjectionContext(() =>
      updatableRxResource({
        params: () => {
          if (fails()) {
            throw failure;
          }
          return 1;
        },
        stream: ({ params }) => of(params),
      }),
    );
    expect(resource.error()).toBe(failure);
    expect(resource.value).toThrow();
    resource.set(5);
    expect(resource.value()).toBe(5);
    fails.set(false);
    expect(resource.status()).toBe('loading');
    TestBed.tick();
    expect(resource.value()).toBe(1);
  });

  it('has the native overloads, default inference, readonly types, and hasValue narrowing', () => {
    expectTypeOf(updatableRxResource).toEqualTypeOf<typeof rxResource>();
    TestBed.runInInjectionContext(() => {
      const optional = updatableRxResource({ stream: () => of(1) });
      expectTypeOf(optional).toEqualTypeOf<ResourceRef<number | undefined>>();
      if (optional.hasValue()) {
        expectTypeOf(optional).toEqualTypeOf<ResourceRef<number>>();
        expectTypeOf(optional.value()).toEqualTypeOf<number>();
      }
      const required = updatableRxResource({
        stream: () => of(1),
        defaultValue: 0,
      });
      expectTypeOf(required).toEqualTypeOf<ResourceRef<number>>();
      expectTypeOf(required.asReadonly()).toEqualTypeOf<Resource<number>>();
      expectTypeOf(required.value.asReadonly()).toEqualTypeOf<Signal<number>>();
      const nullable = updatableRxResource({
        stream: () => of<number | undefined>(1),
        defaultValue: undefined,
      });
      if (nullable.hasValue()) {
        expectTypeOf(nullable.value()).toEqualTypeOf<number>();
      }
      const params = signal<{ id: number } | undefined>(undefined);
      const parameterized = updatableRxResource({
        params,
        stream: (request) => {
          expectTypeOf(request.params).toEqualTypeOf<{ id: number }>();
          return of(request.params.id);
        },
      });
      expectTypeOf(parameterized).toEqualTypeOf<
        ResourceRef<number | undefined>
      >();
    });
  });

  it('rejects invalid options and writes at compile time', () => {
    const checkInvalidInputs = () => {
      updatableRxResource({
        stream: () => of(1),
        // @ts-expect-error defaultValue must not widen the inferred stream type.
        defaultValue: 'invalid',
      });
      const resource = updatableRxResource({ stream: () => of(1) });
      // @ts-expect-error value writes must match the stream's inferred type.
      resource.set('invalid');
      // @ts-expect-error updater results must match the resource value type.
      resource.update(() => 'invalid');
      // @ts-expect-error readonly resource views do not expose set.
      resource.asReadonly().set(1);
      // @ts-expect-error readonly signals do not expose set.
      resource.value.asReadonly().set(1);
      updatableRxResource({
        // @ts-expect-error streams must return an Observable, not a Promise.
        stream: () => Promise.resolve(1),
      });
    };
    expectTypeOf(checkInvalidInputs).toBeFunction();
  });

  it('does not invoke value comparators with the cached error sentinel during recovery', () => {
    const equal = vi.fn((previous: { id: number }, next: { id: number }) => {
      expect(previous).toBeTypeOf('object');
      expect(next).toBeTypeOf('object');
      return previous.id === next.id;
    });
    const resource = TestBed.runInInjectionContext(() =>
      updatableRxResource({
        stream: (): Observable<{ id: number }> =>
          throwError(() => new Error('failed')),
        equal,
      }),
    );
    TestBed.tick();
    expect(resource.value).toThrow();
    resource.set({ id: 1 });
    resource.destroy();
    expect(resource.value()).toBeUndefined();
    expect(equal).not.toHaveBeenCalled();
  });

  it('restores the default on destruction even if custom equality ignores the changed fields', () => {
    const defaultValue = { id: 1, label: 'default' };
    const resource = TestBed.runInInjectionContext(() =>
      updatableRxResource({
        stream: (): Observable<typeof defaultValue> => NEVER,
        defaultValue,
        equal: (previous, next) => previous.id === next.id,
      }),
    );
    resource.set({ id: 2, label: 'local' });
    resource.set({ id: 1, label: 'edited default' });
    expect(resource.value().label).toBe('edited default');
    resource.destroy();
    expect(resource.value()).toBe(defaultValue);
  });

  it('ignores old-stream events between a params change and the next load', async () => {
    const params = signal<number | undefined>(1);
    const oldEvents = new Subject<number>();
    const resource = TestBed.runInInjectionContext(() =>
      updatableRxResource({
        params,
        stream: () => oldEvents,
        defaultValue: 0,
      }),
    );
    TestBed.tick();
    oldEvents.next(1);
    await Promise.resolve();
    params.set(2);
    resource.set(9);
    oldEvents.next(100);
    expect(resource.value()).toBe(9);
    expect(resource.status()).toBe('local');
    params.set(undefined);
    resource.set(10);
    oldEvents.next(200);
    expect(resource.value()).toBe(10);
    expect(resource.status()).toBe('local');
  });
});
