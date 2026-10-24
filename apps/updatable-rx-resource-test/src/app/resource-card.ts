import { Component, input, type ResourceRef } from '@angular/core';

@Component({
  selector: 'gk-resource-card',
  host: { class: 'card', '[attr.data-testid]': 'testId()' },
  template: `
    <h2>{{ heading() }}</h2>
    <p class="hint">{{ hint() }}</p>
    <dl>
      <dt>value</dt>
      <dd data-testid="value">{{ resource().value() }}</dd>
      <dt>status</dt>
      <dd data-testid="status" [class]="resource().status()">{{ resource().status() }}</dd>
      <dt>active subscriptions</dt>
      <dd data-testid="subscriptions">{{ subscriptions() }}</dd>
    </dl>
    <div class="actions">
      <button type="button" data-testid="edit" (click)="addTenLocally()">+10 locally</button>
      <button type="button" data-testid="reset" (click)="resource().set(0)">Set 0 locally</button>
      <button type="button" data-testid="reload" (click)="resource().reload()">Reload</button>
    </div>
  `,
  styles: `
    :host {
      display: block;
      padding: 1.25rem;
      border: 1px solid #d0d7de;
      border-radius: 0.75rem;
      background: #fff;
    }
    h2 {
      margin: 0 0 0.25rem;
      font-size: 1.15rem;
    }
    .hint {
      margin: 0 0 1rem;
      color: #57606a;
      min-height: 2.5rem;
    }
    dl {
      display: grid;
      grid-template-columns: max-content 1fr;
      gap: 0.4rem 1rem;
      margin: 0 0 1rem;
    }
    dt {
      color: #57606a;
    }
    dd {
      margin: 0;
      font-family: ui-monospace, monospace;
      font-weight: 600;
    }
    .local {
      color: #9a6700;
    }
    .resolved {
      color: #1a7f37;
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
  `,
})
export class ResourceCard {
  readonly testId = input.required<string>();
  readonly heading = input.required<string>();
  readonly hint = input.required<string>();
  readonly resource = input.required<ResourceRef<number>>();
  readonly subscriptions = input.required<number>();

  protected addTenLocally(): void {
    this.resource().update((current) => current + 10);
  }
}
