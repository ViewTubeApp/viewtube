import { api } from "@/trpc/react";
import { type inferReactQueryProcedureOptions } from "@trpc/react-query";

import { type AppRouter } from "@/server/api/root";
import { type GetModelListSchema } from "@/server/api/routers/models";

type QueryOptions = inferReactQueryProcedureOptions<AppRouter>["models"]["getModelList"];

export function useModelListQuery(input: GetModelListSchema, options?: QueryOptions) {
  return api.models.getModelList.useQuery(input, options);
}
