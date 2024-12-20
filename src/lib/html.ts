import { type TransitionEvent } from "react";

export function stopPropagation(event: TransitionEvent<HTMLElement>) {
  event.stopPropagation();
}
