import { createTRPCRouter } from "@/server/api/trpc";

import { createDeleteTagProcedure } from "./procedures/tags/delete-tag";
import { createGetTagListProcedure } from "./procedures/tags/get-tag-list";

export const tagsRouter = createTRPCRouter({
  getTagList: createGetTagListProcedure(),
  deleteTag: createDeleteTagProcedure(),
});

export type * from "./procedures/tags/get-tag-list";
export type * from "./procedures/tags/delete-tag";
