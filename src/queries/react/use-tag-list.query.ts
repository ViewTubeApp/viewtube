import { api } from "@/trpc/react";

import { type GetTagListSchema } from "@/server/api/routers/tags";
import { type Tag } from "@/server/db/schema";

export function useTagListQuery(queryOptions: GetTagListSchema = {}, initialData?: Tag[]) {
  return api.tags.getTagList.useQuery(queryOptions, { initialData });
}
