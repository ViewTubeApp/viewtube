import { type BaseSyntheticEvent } from "react";

export function stopPropagation(event: BaseSyntheticEvent): void {
  event.stopPropagation();
}

export function preventDefault(event: BaseSyntheticEvent): void {
  event.preventDefault();
}

export function withStopPropagation<T extends BaseSyntheticEvent>(fn: (event: T) => void): (event: T) => void {
  return (event) => {
    stopPropagation(event);
    fn(event);
  };
}

export function withPreventDefault<T extends BaseSyntheticEvent>(fn: (event: T) => void): (event: T) => void {
  return (event) => {
    preventDefault(event);
    fn(event);
  };
}
