import { ChangeDetectionStrategy, Component } from '@angular/core';
import { profile } from './cv.data';
import { Mailto } from './mailto';

@Component({
  selector: 'gk-nav',
  imports: [Mailto],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header
      class="fixed inset-x-0 top-0 z-50 border-b border-slate-200/60 bg-white/70 backdrop-blur-md dark:border-slate-800/60 dark:bg-slate-950/70"
    >
      <div
        class="scroll-progress from-ng-red via-ng-pink to-ng-violet absolute inset-x-0 bottom-0 h-0.5 origin-left bg-linear-to-r"
        aria-hidden="true"
      ></div>
      <nav
        class="mx-auto flex h-16 max-w-5xl items-center justify-between px-6"
        aria-label="Primary"
      >
        <a href="#top" class="font-semibold tracking-tight text-slate-900 dark:text-white">
          {{ name }}
        </a>
        <ul class="flex gap-5 text-sm font-medium">
          @for (link of links; track link.href) {
            <li class="hidden sm:block">
              <a
                [href]="link.href"
                class="text-slate-600 transition-colors hover:text-ng-violet dark:text-slate-400 dark:hover:text-ng-pink"
              >
                {{ link.label }}
              </a>
            </li>
          }
          <li>
            <button
              type="button"
              gkMailto
              class="from-ng-red via-ng-pink to-ng-violet cursor-pointer rounded-full bg-linear-to-r px-4 py-1.5 text-white transition-transform hover:scale-105"
            >
              Contact
            </button>
          </li>
        </ul>
      </nav>
    </header>
  `,
})
export class Nav {
  protected readonly name = profile.name;
  protected readonly links = [
    { href: '#skills', label: 'Skills' },
    { href: '#experience', label: 'Experience' },
    { href: '#principles', label: 'Style' },
    { href: '#education', label: 'Education' },
  ];
}
