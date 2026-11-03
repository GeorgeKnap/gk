import { ChangeDetectionStrategy, Component } from '@angular/core';
import { experience } from './cv.data';

@Component({
  selector: 'gk-experience',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="experience" class="mx-auto max-w-5xl px-6 py-24">
      <h2 class="reveal text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
        Experience
      </h2>
      <ol class="mt-10 space-y-12 border-l border-slate-200 pl-8 dark:border-slate-800">
        @for (job of jobs; track job.company) {
          <li class="reveal relative">
            <span
              aria-hidden="true"
              class="from-ng-red via-ng-pink to-ng-violet absolute top-1.5 -left-10.5 size-4 rounded-full bg-linear-to-br ring-4 ring-white dark:ring-slate-950"
            ></span>
            <p class="text-sm font-medium text-ng-violet dark:text-ng-pink">{{ job.period }}</p>
            <h3 class="mt-1 text-xl font-semibold text-slate-900 dark:text-white">
              @if (job.url) {
                <a
                  [href]="job.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="hover:underline"
                >
                  {{ job.company }}
                </a>
              } @else {
                {{ job.company }}
              }
            </h3>
            <p class="text-slate-500 italic dark:text-slate-400">{{ job.role }}</p>
            <ul class="mt-3 list-disc space-y-2 pl-5 marker:text-slate-400">
              @for (line of job.summary; track line) {
                <li>{{ line }}</li>
              }
            </ul>
            @if (job.stack) {
              <p class="mt-3 text-sm text-slate-500 dark:text-slate-400">
                <span class="font-medium text-slate-700 dark:text-slate-200">Stack:</span>
                {{ job.stack }}
              </p>
            }
          </li>
        }
      </ol>
    </section>
  `,
})
export class Experience {
  protected readonly jobs = experience;
}
