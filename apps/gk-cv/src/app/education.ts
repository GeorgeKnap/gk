import { ChangeDetectionStrategy, Component } from '@angular/core';
import { education, languages } from './cv.data';

@Component({
  selector: 'gk-education',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="education" class="mx-auto grid max-w-5xl gap-12 px-6 py-24 md:grid-cols-2">
      <div class="reveal">
        <h2 class="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Education</h2>
        <p class="mt-6 text-sm font-medium text-ng-violet dark:text-ng-pink">
          {{ education.period }}
        </p>
        <p class="text-lg font-semibold text-slate-900 italic dark:text-white">
          {{ education.school }}
        </p>
        <p>{{ education.detail }}</p>
      </div>
      <div class="reveal">
        <h2 class="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Languages</h2>
        <ul class="mt-6 space-y-2">
          @for (lang of languages; track lang.name) {
            <li class="flex justify-between border-b border-slate-200 pb-2 dark:border-slate-800">
              <span>{{ lang.name }}</span>
              <span class="text-slate-500 dark:text-slate-400">{{ lang.level }}</span>
            </li>
          }
        </ul>
        <p class="mt-4 text-slate-500 italic dark:text-slate-400">
          “I’m fluent in Google Translate”
        </p>
      </div>
    </section>
  `,
})
export class Education {
  protected readonly education = education;
  protected readonly languages = languages;
}
