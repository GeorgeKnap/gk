import { linkedSignal, Resource, ResourceRef } from '@angular/core';
import { rxResource, RxResourceOptions } from '@angular/core/rxjs-interop';

export function updatableRxResource<T, R>(
  opts: RxResourceOptions<T, R> & { defaultValue: NoInfer<T> }
): ResourceRef<T>;
export function updatableRxResource<T, R>(
  opts: RxResourceOptions<T, R>
): ResourceRef<T | undefined>;
export function updatableRxResource<T, R>(
  opts: RxResourceOptions<T, R>
): ResourceRef<T | undefined> {
  const resource = rxResource(opts);

  // linkedSignal mirrors the resource value but can be overridden locally
  // without cancelling the underlying rxjs stream
  const proxy = linkedSignal<T | undefined>(() => resource.value());

  // Cast required: the type-predicate overload of hasValue cannot be satisfied by a plain lambda
  const hasValue = (() => proxy() !== undefined) as ResourceRef<T | undefined>['hasValue'];

  const asReadonly = (): Resource<T | undefined> =>
    ({
      value: proxy.asReadonly(),
      hasValue: hasValue as Resource<T | undefined>['hasValue'],
      isLoading: resource.isLoading,
      status: resource.status,
      error: resource.error,
    }) as Resource<T | undefined>;

  return {
    value: proxy,
    set: (value: T | undefined) => proxy.set(value),
    update: (updater: (value: T | undefined) => T | undefined) => proxy.update(updater),
    hasValue,
    isLoading: resource.isLoading,
    status: resource.status,
    error: resource.error,
    reload: () => resource.reload(),
    destroy: () => resource.destroy(),
    asReadonly,
  };
}
