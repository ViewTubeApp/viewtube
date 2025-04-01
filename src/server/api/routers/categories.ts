import { createTRPCRouter } from "@/server/api/trpc";

import { createCreateCategoryProcedure } from "./procedures/categories/create-category";
import { createDeleteCategoryProcedure } from "./procedures/categories/delete-category";
import { createGetCategoryByIdProcedure } from "./procedures/categories/get-category-by-id";
import { createGetCategoryListProcedure } from "./procedures/categories/get-category-list";
import { createUpdateCategoryProcedure } from "./procedures/categories/update-category";

export const categoriesRouter = createTRPCRouter({
  getCategoryList: createGetCategoryListProcedure(),
  getCategoryById: createGetCategoryByIdProcedure(),
  createCategory: createCreateCategoryProcedure(),
  updateCategory: createUpdateCategoryProcedure(),
  deleteCategory: createDeleteCategoryProcedure(),
});

export * from "./procedures/categories/get-category-list";
export * from "./procedures/categories/get-category-by-id";
export * from "./procedures/categories/create-category";
export * from "./procedures/categories/update-category";
export * from "./procedures/categories/delete-category";
