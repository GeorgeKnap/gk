import { Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { updatableRxResource } from '@geetium/updatable-rx-resource';
import { ResourceCard } from './resource-card';
import { ServerFeed } from './server-feed';

@Component({
  imports: [ResourceCard],
  selector: 'gk-root',
  template: `
    <main>
      <header>
        <h1>updatableRxResource demo</h1>
        <p>
          Both cards read the same live server feed. Edit a value locally, then push a new server
          value: Angular's <code>rxResource</code> has cancelled its subscription and stays on the
          local value, while <code>updatableRxResource</code> keeps listening.
        </p>
        <div class="server">
          <button type="button" data-testid="push" (click)="feed.push()">Push server value</button>
          <span
            >latest server value: <strong data-testid="latest">{{ feed.latest() }}</strong></span
          >
        </div>
      </header>

      <section class="cards">
        <gk-resource-card
          testId="native"
          heading="rxResource (native)"
          hint="A local edit switches to local state and unsubscribes from the feed."
          [resource]="native"
          [subscriptions]="nativeSubscriptions()"
        />
        <gk-resource-card
          testId="updatable"
          heading="updatableRxResource"
          hint="A local edit is shown until the next server value replaces it."
          [resource]="updatable"
          [subscriptions]="updatableSubscriptions()"
        />
      </section>
    </main>
  `,
  styles: `
    main {
      max-width: 60rem;
      margin: 0 auto;
      padding: 2rem 1.5rem;
    }
    h1 {
      margin-top: 0;
    }
    .server {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin: 1.5rem 0;
    }
    .cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr));
      gap: 1.5rem;
    }
  `,
})
export class App {
  protected readonly feed = inject(ServerFeed);
  protected readonly nativeSubscriptions = this.feed.subscriptions('native');
  protected readonly updatableSubscriptions = this.feed.subscriptions('updatable');

  protected readonly native = rxResource({
    stream: () => this.feed.watch('native'),
    defaultValue: 0,
  });

  protected readonly updatable = updatableRxResource({
    stream: () => this.feed.watch('updatable'),
    defaultValue: 0,
  });
}
