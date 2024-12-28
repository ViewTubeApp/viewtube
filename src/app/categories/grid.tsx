"use client";

import { useCategoryListQuery } from "@/queries/react/use-category-list.query";
import { motion } from "motion/react";
import { type FC } from "react";

import { type CategoryListResponse } from "@/server/api/routers/categories";

import { motions } from "@/constants/motion";
import { categoryListQueryOptions } from "@/constants/query";

import { CategoryCard } from "./card";

interface CategoryGridProps {
  categories: CategoryListResponse;
}

export const CategoryGrid: FC<CategoryGridProps> = ({ categories: initialData }) => {
  const { data: categories = [] } = useCategoryListQuery(categoryListQueryOptions, { initialData });

  return (
    <motion.div
      variants={motions.stagger.container}
      initial="hidden"
      animate="show"
      viewport={{ once: true }}
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {categories.map((category) => (
        <CategoryCard key={category.id} category={category} />
      ))}
    </motion.div>
  );
};
