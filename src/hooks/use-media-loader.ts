import { useState } from "react";

export function useMediaLoader() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);

  return {
    state: { isLoaded, isError },
    props: { onLoad: () => setIsLoaded(true), onError: () => setIsError(true) },
  } as const;
}
