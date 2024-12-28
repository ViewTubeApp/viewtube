import { api } from "@/trpc/react";
import { type inferReactQueryProcedureOptions } from "@trpc/react-query";

import { type AppRouter } from "@/server/api/root";
import { type GetCategoryListSchema } from "@/server/api/routers/categories";

type QueryOptions = inferReactQueryProcedureOptions<AppRouter>["categories"]["getCategoryList"];

export function useCategoryListQuery(input: GetCategoryListSchema, options?: QueryOptions) {
  return api.categories.getCategoryList.useQuery(input, options);
}
