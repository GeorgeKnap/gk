import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  const text = (root: HTMLElement, selector: string) =>
    root.querySelector(selector)?.textContent?.trim();
  const click = (root: HTMLElement, selector: string) =>
    root.querySelector<HTMLButtonElement>(selector)?.click();

  it('keeps updatableRxResource subscribed after a local edit, unlike rxResource', async () => {
    const fixture = TestBed.createComponent(App);
    const root = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();

    expect(text(root, '[data-testid=native] [data-testid=value]')).toBe('1');
    expect(text(root, '[data-testid=updatable] [data-testid=value]')).toBe('1');

    click(root, '[data-testid=native] [data-testid=edit]');
    click(root, '[data-testid=updatable] [data-testid=edit]');
    await fixture.whenStable();

    expect(text(root, '[data-testid=native] [data-testid=value]')).toBe('11');
    expect(text(root, '[data-testid=updatable] [data-testid=value]')).toBe('11');
    expect(text(root, '[data-testid=updatable] [data-testid=status]')).toBe('local');
    expect(text(root, '[data-testid=native] [data-testid=subscriptions]')).toBe('0');
    expect(text(root, '[data-testid=updatable] [data-testid=subscriptions]')).toBe('1');

    click(root, '[data-testid=push]');
    await fixture.whenStable();

    expect(text(root, '[data-testid=latest]')).toBe('2');
    expect(text(root, '[data-testid=native] [data-testid=value]')).toBe('11');
    expect(text(root, '[data-testid=native] [data-testid=status]')).toBe('local');
    expect(text(root, '[data-testid=updatable] [data-testid=value]')).toBe('2');
    expect(text(root, '[data-testid=updatable] [data-testid=status]')).toBe('resolved');
  });
});
