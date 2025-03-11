import { z } from "zod";

export const paginationSchema = z.object({
  pageSize: z.number(),
  pageIndex: z.number(),
});

export type PaginationSchema = z.infer<typeof paginationSchema>;
