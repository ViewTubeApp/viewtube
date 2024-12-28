"use client";

import { useCategoryListQuery } from "@/queries/react/use-category-list.query";
import { type FC } from "react";

import { type CategoryListResponse } from "@/server/api/routers/categories";

import { categoryListQueryOptions } from "@/constants/query";

import { DataTable } from "@/components/ui/data-table";

import { CategoryCard } from "./card";
import { columns } from "./columns";

interface CategoriesTableProps {
  initialData: CategoryListResponse;
}

export const CategoriesTable: FC<CategoriesTableProps> = ({ initialData }) => {
  const { data = [] } = useCategoryListQuery(categoryListQueryOptions, { initialData });
  return <DataTable columns={columns} data={data} renderCard={(category) => <CategoryCard category={category} />} />;
};
