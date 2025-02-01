import { api } from "@/trpc/server";

import { type GetModelListSchema } from "@/server/api/routers/models";

export async function loadModelList(queryOptions: GetModelListSchema) {
  void api.models.getModelList.prefetch(queryOptions);
  return api.models.getModelList(queryOptions);
}
