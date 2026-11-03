import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Contact } from './contact';
import { Education } from './education';
import { Experience } from './experience';
import { Hero } from './hero';
import { Nav } from './nav';
import { Principles } from './principles';
import { Skills } from './skills';

@Component({
  imports: [Nav, Hero, Skills, Experience, Principles, Education, Contact],
  selector: 'gk-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <gk-nav />
    <main>
      <gk-hero />
      <gk-skills />
      <gk-experience />
      <gk-principles />
      <gk-education />
    </main>
    <gk-contact />
  `,
})
export class App {}
