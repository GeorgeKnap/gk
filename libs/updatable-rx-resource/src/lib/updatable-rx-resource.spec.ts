import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { updatableRxResource } from './updatable-rx-resource';

describe('updatableRxResource', () => {
  function setup<T>(stream$: Subject<T>, defaultValue?: T) {
    return TestBed.runInInjectionContext(() =>
      updatableRxResource<T, void>(
        defaultValue !== undefined
          ? { stream: () => stream$, defaultValue: defaultValue as T }
          : { stream: () => stream$ }
      )
    );
  }

  it('should start as loading', () => {
    const stream$ = new Subject<number>();
    const resource = setup(stream$);

    expect(resource.isLoading()).toBe(true);
    expect(resource.status()).toBe('loading');
  });

  it('should return value from stream once it emits', async () => {
    const stream$ = new Subject<number>();
    const resource = setup(stream$);

    stream$.next(42);
    await TestBed.flushEffects();

    expect(resource.value()).toBe(42);
    expect(resource.isLoading()).toBe(false);
    expect(resource.status()).toBe('resolved');
  });

  it('should have undefined value before stream emits', () => {
    const stream$ = new Subject<number>();
    const resource = setup(stream$);

    expect(resource.value()).toBeUndefined();
    expect(resource.hasValue()).toBe(false);
  });

  it('should report hasValue() true after stream emits', async () => {
    const stream$ = new Subject<number>();
    const resource = setup(stream$);

    stream$.next(10);
    await TestBed.flushEffects();

    expect(resource.hasValue()).toBe(true);
  });

  it('set() should update the proxy value without cancelling the stream', async () => {
    const stream$ = new Subject<number>();
    const resource = setup(stream$);

    stream$.next(1);
    await TestBed.flushEffects();
    expect(resource.value()).toBe(1);

    // Set a new value - this should NOT cancel the stream
    resource.set(99);
    expect(resource.value()).toBe(99);

    // Stream is still active - new emission should flow through
    stream$.next(2);
    await TestBed.flushEffects();
    expect(resource.value()).toBe(2);
  });

  it('set() should not reset status to loading (stream not cancelled)', async () => {
    const stream$ = new Subject<number>();
    const resource = setup(stream$);

    stream$.next(5);
    await TestBed.flushEffects();
    expect(resource.status()).toBe('resolved');

    resource.set(99);

    // Status should remain Resolved - stream was not cancelled
    expect(resource.status()).toBe('resolved');
    expect(resource.isLoading()).toBe(false);
  });

  it('update() should transform the proxy value without cancelling the stream', async () => {
    const stream$ = new Subject<number>();
    const resource = setup(stream$);

    stream$.next(10);
    await TestBed.flushEffects();

    resource.update((v) => (v ?? 0) + 5);
    expect(resource.value()).toBe(15);

    // Stream is still active
    stream$.next(20);
    await TestBed.flushEffects();
    expect(resource.value()).toBe(20);
  });

  it('update() should not reset status to loading (stream not cancelled)', async () => {
    const stream$ = new Subject<number>();
    const resource = setup(stream$);

    stream$.next(5);
    await TestBed.flushEffects();

    resource.update((v) => (v ?? 0) * 2);

    expect(resource.status()).toBe('resolved');
    expect(resource.isLoading()).toBe(false);
  });

  it('should reflect stream errors in error()', async () => {
    const stream$ = new Subject<number>();
    const resource = setup(stream$);

    stream$.error(new Error('stream failed'));
    await TestBed.flushEffects();

    expect(resource.status()).toBe('error');
    expect(resource.error()).toBeInstanceOf(Error);
    expect((resource.error() as Error).message).toBe('stream failed');
  });

  it('reload() should re-subscribe to the stream', async () => {
    const stream$ = new Subject<number>();
    let subscriptionCount = 0;

    const resource = TestBed.runInInjectionContext(() =>
      updatableRxResource<number, void>({
        stream: () => {
          subscriptionCount++;
          return stream$;
        },
      })
    );

    await TestBed.flushEffects();
    expect(subscriptionCount).toBe(1);

    resource.reload();
    await TestBed.flushEffects();
    expect(subscriptionCount).toBe(2);
  });

  it('should use defaultValue when provided', () => {
    const stream$ = new Subject<number>();
    const resource = TestBed.runInInjectionContext(() =>
      updatableRxResource<number, void>({
        stream: () => stream$,
        defaultValue: 0,
      })
    );

    expect(resource.value()).toBe(0);
  });

  it('asReadonly() value should reflect proxy value', async () => {
    const stream$ = new Subject<number>();
    const resource = setup(stream$);
    const readonly = resource.asReadonly();

    stream$.next(7);
    await TestBed.flushEffects();
    expect(readonly.value()).toBe(7);

    resource.set(42);
    expect(readonly.value()).toBe(42);
  });

  it('asReadonly() should reflect isLoading and status', async () => {
    const stream$ = new Subject<number>();
    const resource = setup(stream$);
    const readonly = resource.asReadonly();

    expect(readonly.isLoading()).toBe(true);

    stream$.next(3);
    await TestBed.flushEffects();

    expect(readonly.isLoading()).toBe(false);
    expect(readonly.status()).toBe('resolved');
  });

  it('destroy() should clean up the resource', async () => {
    const stream$ = new Subject<number>();
    const resource = setup(stream$);

    stream$.next(1);
    await TestBed.flushEffects();

    expect(() => resource.destroy()).not.toThrow();
  });

  it('should track multiple successive stream emissions', async () => {
    const stream$ = new Subject<string>();
    const resource = setup(stream$);

    stream$.next('a');
    await TestBed.flushEffects();
    expect(resource.value()).toBe('a');

    stream$.next('b');
    await TestBed.flushEffects();
    expect(resource.value()).toBe('b');

    stream$.next('c');
    await TestBed.flushEffects();
    expect(resource.value()).toBe('c');
  });
});
