import { ChangeDetectionStrategy, Component } from '@angular/core';
import { skillGroups } from './cv.data';

@Component({
  selector: 'gk-skills',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="skills" class="mx-auto max-w-5xl px-6 py-24">
      <h2 class="reveal text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
        Core skills
      </h2>
      <div class="mt-10 grid gap-6 md:grid-cols-2">
        @for (group of groups; track group.title) {
          <article
            class="reveal rounded-2xl border border-slate-200 bg-slate-50/60 p-6 dark:border-slate-800 dark:bg-slate-900/40"
          >
            <h3 class="font-semibold text-ng-violet dark:text-ng-pink">{{ group.title }}</h3>
            <ul class="mt-4 flex flex-wrap gap-2">
              @for (item of group.items; track item) {
                <li
                  class="rounded-full bg-white px-3 py-1 text-sm ring-1 ring-slate-200 transition-transform hover:-translate-y-0.5 dark:bg-slate-800 dark:ring-slate-700"
                >
                  {{ item }}
                </li>
              }
            </ul>
          </article>
        }
      </div>
    </section>
  `,
})
export class Skills {
  protected readonly groups = skillGroups;
}
