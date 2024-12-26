import { api } from "@/trpc/react";

import { type GetCategoryListSchema } from "@/server/api/routers/categories";
import { type Category } from "@/server/db/schema";

export function useCategoryListQuery(queryOptions: GetCategoryListSchema, initialData?: Category[]) {
  return api.categories.getCategoryList.useQuery(queryOptions, { initialData });
}
