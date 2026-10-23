import {
  computed,
  DestroyRef,
  inject,
  Injector,
  linkedSignal,
  type ResourceParamsContext,
  type ResourceRef,
  type ResourceSnapshot,
  type ResourceStatus,
  signal,
  untracked,
} from '@angular/core';
import { rxResource, type RxResourceOptions } from '@angular/core/rxjs-interop';
import { tap } from 'rxjs';

/**
 * An rxResource whose local writes update a linked signal without cancelling its stream.
 *
 * The next source emission or parameter/lifecycle change replaces the local override.
 * Local writes report `local` status; reload eligibility and loader metadata continue
 * to reflect the untouched native resource. All options and overloads match rxResource.
 */
export function updatableRxResource<T, R>(
  options: RxResourceOptions<T, R> & { defaultValue: NoInfer<T> },
): ResourceRef<T>;
export function updatableRxResource<T, R>(
  options: RxResourceOptions<T, R>,
): ResourceRef<T | undefined>;
export function updatableRxResource<T, R>(
  options: RxResourceOptions<T, R>,
): ResourceRef<T | undefined> {
  const injector = options.injector ?? inject(Injector);
  const destroyed = signal(false);
  const revision = signal(0);
  const paramsFn = options.params;
  let paramsContext: ResourceParamsContext;
  const parameters = paramsFn
    ? computed<{ value: R } | { error: unknown }>(() => {
        try {
          return { value: paramsFn(paramsContext) };
        } catch (error) {
          return { error };
        }
      })
    : undefined;
  const native = rxResource<T, R>({
    ...options,
    injector,
    params: parameters
      ? (context) => {
          paramsContext = context;
          const result = parameters();
          if ('error' in result) {
            throw result.error;
          }
          return result.value;
        }
      : undefined,
    stream: (params) =>
      options.stream(params).pipe(
        tap(() => {
          const currentParams = untracked(() => parameters?.());
          const isCurrent =
            !currentParams ||
            ('value' in currentParams &&
              Object.is(currentParams.value, params.params));
          if (
            isCurrent &&
            !params.abortSignal.aborted &&
            !untracked(destroyed)
          ) {
            revision.update((current) => current + 1);
          }
        }),
      ),
  });
  const source = computed(() => ({
    snapshot: native.snapshot(),
    revision: revision(),
    destroyed: destroyed(),
    parameters: destroyed() ? undefined : parameters?.(),
  }));
  const local = linkedSignal({ source, computation: () => false });
  const value = linkedSignal({
    source,
    computation: () => native.value(),
    equal: (previous, next) => {
      if (untracked(destroyed) || untracked(native.status) === 'error') {
        return false;
      }
      return previous === undefined || next === undefined
        ? Object.is(previous, next)
        : (options.equal?.(previous, next) ?? Object.is(previous, next));
    },
    set: (next, rawSet) => {
      if (!untracked(destroyed)) {
        untracked(() => {
          local.set(true);
          rawSet(next);
        });
      }
    },
  });
  const status = computed<ResourceStatus>(() =>
    local() ? 'local' : native.status(),
  );
  const error = computed(() => (local() ? undefined : native.error()));
  const isLoading = computed(
    () => status() === 'loading' || status() === 'reloading',
  );
  const snapshot = computed<ResourceSnapshot<T | undefined>>(() => {
    if (local()) {
      return { status: 'local', value: value() };
    }
    const current = native.snapshot();
    return current.status === 'error'
      ? current
      : { status: current.status, value: value() };
  });
  const destroy = () => {
    if (!untracked(destroyed)) {
      destroyed.set(true);
      unregisterOnDestroy();
      native.destroy();
    }
  };
  const unregisterOnDestroy = injector.get(DestroyRef).onDestroy(destroy);

  function hasValue(
    this: ResourceRef<T | undefined>,
  ): this is ResourceRef<Exclude<T, undefined>> {
    return status() !== 'error' && value() !== undefined;
  }

  const resource: ResourceRef<T | undefined> = {
    value,
    status,
    error,
    isLoading,
    snapshot,
    hasValue,
    set: (next) => value.set(next),
    update: (updater) => value.update(updater),
    asReadonly: () => resource,
    reload: () => native.reload(),
    destroy,
  };
  return resource;
}
