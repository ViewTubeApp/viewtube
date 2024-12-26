"use client";

import { useCategoryListQuery } from "@/queries/react/use-category-list-query";
import { type FC } from "react";

import { type Category } from "@/server/db/schema";

import { categoryListQueryOptions } from "@/constants/query";

import { DataTable } from "@/components/ui/data-table";

import { columns } from "./columns";

interface CategoriesTableProps {
  initialData: Category[];
}

export const CategoriesTable: FC<CategoriesTableProps> = ({ initialData }) => {
  const { data = [] } = useCategoryListQuery(categoryListQueryOptions, initialData);
  return <DataTable columns={columns} data={data} />;
};
