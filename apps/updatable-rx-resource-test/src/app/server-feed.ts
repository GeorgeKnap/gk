import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, defer, finalize, type Observable } from 'rxjs';

export type FeedConsumer = 'native' | 'updatable';

/** Simulates a live server stream, e.g. a WebSocket, shared by both demo resources. */
@Injectable({ providedIn: 'root' })
export class ServerFeed {
  private readonly source = new BehaviorSubject(1);
  private readonly subscriptionCounts = {
    native: signal(0),
    updatable: signal(0),
  };

  readonly latest = signal(1);

  subscriptions(consumer: FeedConsumer) {
    return this.subscriptionCounts[consumer].asReadonly();
  }

  push(): void {
    const next = this.latest() + 1;
    this.latest.set(next);
    this.source.next(next);
  }

  watch(consumer: FeedConsumer): Observable<number> {
    const count = this.subscriptionCounts[consumer];
    return defer(() => {
      count.update((current) => current + 1);
      return this.source.pipe(finalize(() => count.update((current) => current - 1)));
    });
  }
}
