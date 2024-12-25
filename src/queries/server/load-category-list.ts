import { api } from "@/trpc/server";

import { type GetCategoryListSchema } from "@/server/api/routers/categories";

export async function loadCategoryList(queryOptions: GetCategoryListSchema) {
  void api.categories.getCategoryList.prefetch(queryOptions);
  return api.categories.getCategoryList(queryOptions);
}
