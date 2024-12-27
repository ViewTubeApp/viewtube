import { api } from "@/trpc/react";

import { type CategoryListResponse, type GetCategoryListSchema } from "@/server/api/routers/categories";

export function useCategoryListQuery(queryOptions: GetCategoryListSchema, initialData?: CategoryListResponse) {
  return api.categories.getCategoryList.useQuery(queryOptions, { initialData });
}
