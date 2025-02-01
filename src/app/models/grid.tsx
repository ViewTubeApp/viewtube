"use client";

import { useInfiniteQueryObserver } from "@/hooks/use-infinite-query-observer";
import { api } from "@/trpc/react";
import { getNextPageParam } from "@/utils/react/query";
import { motion } from "motion/react";
import { parseAsString, useQueryState } from "nuqs";
import { type FC } from "react";

import { type GetModelListSchema, type ModelListResponse } from "@/server/api/routers/models";

import { motions } from "@/constants/motion";

import { ModelCard } from "./card";

interface ModelGridProps {
  input: GetModelListSchema;
  models: ModelListResponse;
}

export const ModelGrid: FC<ModelGridProps> = ({ input, models: initialData }) => {
  const [searchQuery] = useQueryState("q", parseAsString.withDefault(""));

  const query = api.models.getModelList.useInfiniteQuery(
    { ...input, query: searchQuery },
    { initialData: { pages: [initialData], pageParams: [] }, getNextPageParam },
  );

  const { ref } = useInfiniteQueryObserver(query);

  return (
    <motion.div {...motions.fade.in} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {query.data?.pages
        .flatMap((page) => page.data)
        .map((model) => <ModelCard key={model.id} model={model} ref={ref} />)}
    </motion.div>
  );
};
