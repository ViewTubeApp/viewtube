import "server-only";

import { log as globalLog } from "@/server/logger";

export function perf<T extends (...args: unknown[]) => unknown>(label: string, fn: T): ReturnType<T> {
  const log = globalLog.withTag(label);

  const t1 = performance.now();
  const result = fn();
  const t2 = performance.now();

  if (t2 - t1 > 1000) {
    log.warn(`Took ${(t2 - t1).toFixed(2)}ms to execute`);
  } else {
    log.start(`Took ${(t2 - t1).toFixed(2)}ms to execute`);
  }

  return result as ReturnType<T>;
}

export async function perfAsync<T extends (...args: unknown[]) => Promise<unknown>>(
  label: string,
  fn: T,
): Promise<ReturnType<T>> {
  const log = globalLog.withTag(label);

  const t1 = performance.now();
  const result = await fn();
  const t2 = performance.now();

  if (t2 - t1 > 1000) {
    log.warn(`Took ${(t2 - t1).toFixed(2)}ms to execute`);
  } else {
    log.start(`Took ${(t2 - t1).toFixed(2)}ms to execute`);
  }

  return result as ReturnType<T>;
}
