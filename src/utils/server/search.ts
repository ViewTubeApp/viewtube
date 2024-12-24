import { createSearchParamsCache, parseAsString } from "nuqs/server";
import "server-only";

export const searchParamsCache = createSearchParamsCache({
  q: parseAsString.withDefault(""),
});
