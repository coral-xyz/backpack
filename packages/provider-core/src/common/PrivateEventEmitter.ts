import type { EventArgs, EventListener } from "eventemitter3";
import { EventEmitter } from "eventemitter3";

type EventTypes = symbol | string;
/*
 * Converts EventEmitter to a type so that it can
 * be implemented by `PrivateEventEmitter`
 */
export class EventEmitterClass extends EventEmitter {
  constructor() {
    super();
  }
}

/*
 * A proxy to EventEmitter3 that works even when a class that extends
 * the `PrivateEventEmitter` is frozen.
 * Original implementation of `EventEmitter3` breaks on the addListener function
 * if the object is frozen.
 */
export class PrivateEventEmitter implements EventEmitterClass {
  #emitterInstance: EventEmitterClass;
  constructor() {
    this.#emitterInstance = new EventEmitterClass();
  }

  eventNames(): EventTypes[] {
    return this.#emitterInstance.eventNames();
  }
  listeners<T extends EventTypes>(event: T): ((...args: any[]) => void)[] {
    return this.#emitterInstance.listeners(event);
  }
  listenerCount(event: EventTypes): number {
    return this.#emitterInstance.listenerCount(event);
  }
  once<T extends EventTypes>(
    event: T,
    fn: (...args: any[]) => void,
    context?: any
  ): this {
    this.#emitterInstance.once(event, fn, context);
    return this;
  }
  removeListener<T extends EventTypes>(
    event: T,
    fn?: ((...args: any[]) => void) | undefined,
    context?: any,
    once?: boolean | undefined
  ): this {
    this.#emitterInstance.removeListener(event, fn, context, once);
    return this;
  }
  removeAllListeners(event?: EventTypes | undefined): this {
    this.#emitterInstance.removeAllListeners(event);
    return this;
  }
  on<T extends EventTypes>(
    event: T,
    fn: (...args: any[]) => void,
    context?: any
  ) {
    this.#emitterInstance.on(event, fn, context);
    return this;
  }
  off<T extends EventTypes>(
    event: T,
    fn?: EventListener<EventTypes, T>,
    context?: any,
    once?: boolean
  ) {
    this.#emitterInstance.off(event, fn, context, once);
    return this;
  }
  emit<T extends EventTypes>(event: T, ...args: EventArgs<EventTypes, T>) {
    return this.#emitterInstance.emit(event, ...args);
  }
  addListener<T extends EventTypes>(
    event: T,
    fn: EventListener<EventTypes, T>,
    context?: any
  ) {
    this.#emitterInstance.addListener(event, fn, context);
    return this;
  }
}
