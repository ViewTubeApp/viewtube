import { formatISO } from "date-fns/formatISO";

interface GetNextPageParamOptions {
  data: Array<{
    id: string;
    createdAt: Date;
  }>;
}

export function getNextPageParam(lastPage: GetNextPageParamOptions) {
  const lastPageItems = lastPage.data.at(-1);
  if (!lastPageItems) return undefined;

  return {
    id: lastPageItems.id,
    createdAt: formatISO(lastPageItems.createdAt),
  } satisfies CursorShape;
}
