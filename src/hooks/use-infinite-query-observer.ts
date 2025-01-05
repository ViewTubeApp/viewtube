import { useCallback, useRef } from "react";

interface UseInfiniteQueryObserverOptions {
  isLoading: boolean;
  hasNextPage: boolean;
  isFetching: boolean;
  fetchNextPage: () => Promise<unknown>;
}

export function useInfiniteQueryObserver(options: UseInfiniteQueryObserverOptions) {
  const { isLoading, hasNextPage, isFetching, fetchNextPage } = options;

  const observer = useRef<IntersectionObserver | null>(null);

  const lastElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (isLoading) return;

      if (observer.current) {
        observer.current.disconnect();
      }

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetching) {
          void fetchNextPage();
        }
      });

      if (node) {
        observer.current.observe(node);
      }
    },
    [fetchNextPage, hasNextPage, isFetching, isLoading],
  );

  return { ref: lastElementRef } as const;
}
