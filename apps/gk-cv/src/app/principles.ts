import { ChangeDetectionStrategy, Component } from '@angular/core';
import { codingStyle } from './cv.data';

@Component({
  selector: 'gk-principles',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="principles" class="mx-auto max-w-5xl px-6 py-24">
      <h2 class="reveal text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
        My coding style
      </h2>
      <ul class="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        @for (rule of rules; track rule) {
          <li
            class="reveal rounded-2xl border border-slate-200 p-5 transition-colors hover:border-ng-violet dark:border-slate-800 dark:hover:border-ng-pink"
          >
            {{ rule }}
          </li>
        }
      </ul>
    </section>
  `,
})
export class Principles {
  protected readonly rules = codingStyle;
}
