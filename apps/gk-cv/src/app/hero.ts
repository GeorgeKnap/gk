import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { profile } from './cv.data';
import { Links } from './links';

@Component({
  selector: 'gk-hero',
  imports: [Links, NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section
      id="top"
      class="relative isolate flex min-h-svh items-center overflow-hidden px-6 pt-16"
    >
      <div aria-hidden="true" class="pointer-events-none absolute inset-0 -z-10">
        <div
          class="from-ng-red motion-safe:animate-float absolute -top-24 -left-24 size-96 rounded-full bg-linear-to-br to-transparent opacity-30 blur-3xl"
        ></div>
        <div
          class="to-ng-violet motion-safe:animate-float absolute right-0 bottom-0 size-112 rounded-full bg-linear-to-tl from-transparent opacity-30 blur-3xl [animation-delay:-7s]"
        ></div>
      </div>

      <div class="mx-auto w-full max-w-5xl">
        <p
          class="motion-safe:animate-fade-up text-sm font-medium tracking-widest text-ng-violet uppercase dark:text-ng-pink"
        >
          {{ profile.location }}
        </p>
        <div class="mt-4 flex items-center gap-5 sm:gap-8">
          <div
            class="motion-safe:animate-fade-up relative size-24 shrink-0 overflow-hidden rounded-full bg-white ring-4 ring-ng-pink/60 sm:size-36"
          >
            <img
              [ngSrc]="profile.photo"
              [alt]="profile.name"
              fill
              priority
              class="object-cover object-top"
            />
          </div>
          <h1
            class="from-ng-red via-ng-pink to-ng-violet motion-safe:animate-shimmer bg-linear-to-r bg-size-[200%_auto] bg-clip-text pb-2 text-5xl font-bold tracking-tight text-transparent sm:text-7xl"
          >
            {{ profile.name }}
          </h1>
        </div>
        <p
          class="motion-safe:animate-fade-up mt-4 text-xl font-medium text-slate-900 [animation-delay:150ms] sm:text-2xl dark:text-white"
        >
          {{ profile.title }}
        </p>
        <p
          class="motion-safe:animate-fade-up mt-1 text-lg text-slate-500 [animation-delay:250ms] dark:text-slate-400"
        >
          {{ profile.tagline }}
        </p>
        <p
          class="motion-safe:animate-fade-up mt-8 max-w-2xl text-lg leading-relaxed [animation-delay:350ms]"
        >
          {{ profile.summary }}
        </p>
        <gk-links class="motion-safe:animate-fade-up mt-10 block [animation-delay:450ms]" />
      </div>
    </section>
  `,
})
export class Hero {
  protected readonly profile = profile;
}
