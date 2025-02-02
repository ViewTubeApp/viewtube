import * as m from "@/paraglide/messages";
import { api } from "@/trpc/server";
import { searchParamsCache } from "@/utils/server/search";
import { type Metadata } from "next";
import { type SearchParams } from "nuqs/server";

import { type GetModelListSchema } from "@/server/api/routers/models";

import { adminModelListQueryOptions } from "@/constants/query";

import { ModelGrid } from "./grid";

export function generateMetadata() {
  return { title: m.models() } satisfies Metadata;
}

interface ModelsPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function ModelsPage({ searchParams }: ModelsPageProps) {
  const { q: query } = await searchParamsCache.parse(searchParams);

  const input: GetModelListSchema = { ...adminModelListQueryOptions, query };
  const models = await api.models.getModelList(input);

  return <ModelGrid input={input} models={models} />;
}
