import { loadCategoryList } from "@/queries/server/load-category-list";
import { type Metadata } from "next";

import { categoryListQueryOptions } from "@/constants/query";

import { CategoryGrid } from "./grid";

export const metadata: Metadata = {
  title: "Categories",
};

export default async function CategoriesPage() {
  const categories = await loadCategoryList(categoryListQueryOptions);
  return <CategoryGrid categories={categories} />;
}
