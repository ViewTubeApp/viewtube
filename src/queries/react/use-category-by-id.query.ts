import { api } from "@/trpc/react";
import { skipToken } from "@tanstack/react-query";
import { type inferReactQueryProcedureOptions } from "@trpc/react-query";

import { type AppRouter } from "@/server/api/root";

type QueryOptions = inferReactQueryProcedureOptions<AppRouter>["categories"]["getCategoryById"];

export function useCategoryByIdQuery(id?: string, options?: QueryOptions) {
  return api.categories.getCategoryById.useQuery(id ? { id } : skipToken, options);
}
