import { createTRPCRouter } from "@/server/api/trpc";

import { createCreateCategoryProcedure } from "./procedures/categories/createCategory";
import { createDeleteCategoryProcedure } from "./procedures/categories/deleteCategory";
import { createGetCategoryByIdProcedure } from "./procedures/categories/getCategoryById";
import { createGetCategoryListProcedure } from "./procedures/categories/getCategoryList";
import { createUpdateCategoryProcedure } from "./procedures/categories/updateCategory";

export const categoriesRouter = createTRPCRouter({
  getCategoryList: createGetCategoryListProcedure(),
  getCategoryById: createGetCategoryByIdProcedure(),
  createCategory: createCreateCategoryProcedure(),
  updateCategory: createUpdateCategoryProcedure(),
  deleteCategory: createDeleteCategoryProcedure(),
});

export * from "./procedures/categories/getCategoryList";
export * from "./procedures/categories/getCategoryById";
export * from "./procedures/categories/createCategory";
export * from "./procedures/categories/updateCategory";
export * from "./procedures/categories/deleteCategory";
