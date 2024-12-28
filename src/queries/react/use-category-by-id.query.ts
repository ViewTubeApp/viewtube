import { api } from "@/trpc/react";
import { skipToken } from "@tanstack/react-query";
import { type inferReactQueryProcedureOptions } from "@trpc/react-query";

import { type AppRouter } from "@/server/api/root";
import { type GetCategoryByIdSchema } from "@/server/api/routers/categories";

type QueryOptions = inferReactQueryProcedureOptions<AppRouter>["categories"]["getCategoryById"];

export function useCategoryByIdQuery(input?: GetCategoryByIdSchema, options?: QueryOptions) {
  return api.categories.getCategoryById.useQuery(input ?? skipToken, options);
}
