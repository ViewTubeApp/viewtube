import { api } from "@/trpc/react";
import { type inferReactQueryProcedureOptions } from "@trpc/react-query";

import { type AppRouter } from "@/server/api/root";
import { type GetTagListSchema } from "@/server/api/routers/tags";

type QueryOptions = inferReactQueryProcedureOptions<AppRouter>["tags"]["getTagList"];

export function useTagListQuery(input: GetTagListSchema, options?: QueryOptions) {
  return api.tags.getTagList.useQuery(input, options);
}
