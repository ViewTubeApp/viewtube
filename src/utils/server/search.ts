import { createSearchParamsCache, parseAsInteger, parseAsJson, parseAsString, parseAsStringEnum } from "nuqs/server";
import "server-only";

import { paginationSchema } from "../pagination";

export type SortQuery = "new" | "popular";

export const userSearchParamsCache = createSearchParamsCache({
  q: parseAsString,
  m: parseAsInteger,
  c: parseAsInteger,
  t: parseAsInteger,
  s: parseAsStringEnum<SortQuery>(["new", "popular"]),
});

export const adminSearchParamsCache = createSearchParamsCache({
  q: parseAsString.withDefault(""),
  page: parseAsJson(paginationSchema.parse.bind(paginationSchema))
    .withDefault({ pageIndex: 0, pageSize: 10 })
    .withOptions({ clearOnDefault: true }),
});
