import { api } from "@/trpc/server";

import { type GetCategoriesSchema } from "@/server/api/routers/categories";

export async function loadCategoryList(queryOptions: GetCategoriesSchema) {
  void api.categories.getCategories.prefetch(queryOptions);
  return api.categories.getCategories(queryOptions);
}
