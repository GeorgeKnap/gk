import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [App] }).compileComponents();
  });

  it('renders the CV sections', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('h1')?.textContent).toContain('George Knap');
    for (const id of ['skills', 'experience', 'principles', 'education']) {
      expect(el.querySelector(`#${id}`)).not.toBeNull();
    }
    expect(el.querySelectorAll('#experience li.reveal').length).toBeGreaterThan(0);
  });
});
