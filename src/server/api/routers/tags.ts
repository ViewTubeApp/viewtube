import { P, match } from "ts-pattern";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const getTagListSchema = z.object({
  query: z.string().optional().nullable(),
});

export type GetTagListSchema = z.infer<typeof getTagListSchema>;

export const tagsRouter = createTRPCRouter({
  getTagList: publicProcedure.input(getTagListSchema).query(async ({ ctx, input }) => {
    return ctx.db.query.tags.findMany({
      orderBy: (tags, { desc }) => [desc(tags.createdAt)],
      where: (tags, { ilike }) => {
        return match(input)
          .with({ query: P.string }, ({ query }) => ilike(tags.name, "%" + query + "%"))
          .otherwise(() => undefined);
      },
    });
  }),
});
