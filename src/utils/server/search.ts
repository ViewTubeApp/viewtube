import { createSearchParamsCache, parseAsJson, parseAsString } from "nuqs/server";
import "server-only";

export const searchParamsCache = createSearchParamsCache({
  q: parseAsString.withDefault(""),
});
