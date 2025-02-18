import { createTRPCRouter } from "@/server/api/trpc";

import { createDeleteTagProcedure } from "./procedures/tags/deleteTag";
import { createGetTagListProcedure } from "./procedures/tags/getTagList";

export const tagsRouter = createTRPCRouter({
  getTagList: createGetTagListProcedure(),
  deleteTag: createDeleteTagProcedure(),
});

export type * from "./procedures/tags/getTagList";
export type * from "./procedures/tags/deleteTag";
