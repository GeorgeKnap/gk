import { ChangeDetectionStrategy, Component } from '@angular/core';
import { profile } from './cv.data';
import { Links } from './links';

@Component({
  selector: 'gk-contact',
  imports: [Links],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="border-t border-slate-200 px-6 py-24 text-center dark:border-slate-800">
      <h2 class="reveal text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
        Let’s build something
      </h2>
      <p class="reveal mt-4">{{ profile.location }}</p>
      <gk-links [center]="true" class="reveal mt-8 block" />
    </footer>
  `,
})
export class Contact {
  protected readonly profile = profile;
}
