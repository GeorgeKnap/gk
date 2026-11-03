import { Directive, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

/** Builds the address only on click, so it never appears in the prerendered HTML. */
@Directive({
  selector: '[gkMailto]',
  host: { '(click)': 'open()' },
})
export class Mailto {
  private readonly document = inject(DOCUMENT);

  protected open(): void {
    const address = ['knap.george.at', 'gmail.com'].join('@');
    this.document.location.href = `mailto:${address}`;
  }
}
