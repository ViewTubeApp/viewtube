import { createSearchParamsCache, parseAsInteger, parseAsString, parseAsStringEnum } from "nuqs/server";
import "server-only";

export const searchParamsCache = createSearchParamsCache({
  q: parseAsString,
  m: parseAsInteger,
  c: parseAsInteger,
  s: parseAsStringEnum(["new", "popular"]),
});
