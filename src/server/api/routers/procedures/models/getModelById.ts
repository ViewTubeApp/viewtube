import { eq } from "drizzle-orm";
import { z } from "zod";

import { publicProcedure } from "@/server/api/trpc";
import { models } from "@/server/db/schema";

export const createGetModelByIdProcedure = () =>
  publicProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.query.models.findFirst({ where: eq(models.id, input.id) });
    });
