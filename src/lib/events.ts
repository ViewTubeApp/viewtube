import { on } from "events";
import EventEmitter from "events";

type EventMap<T> = {
  [K in keyof T]: readonly unknown[];
};

export class IterableEventEmitter<T extends EventMap<T>> extends EventEmitter {
  toIterable<TEventName extends keyof T & string>(
    eventName: TEventName,
    opts?: NonNullable<Parameters<typeof on>[2]>,
  ): AsyncIterableIterator<T[TEventName]> {
    return on(this, eventName, opts) as AsyncIterableIterator<T[TEventName]>;
  }
}
