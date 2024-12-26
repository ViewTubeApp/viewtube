import { type inferRouterInputs, type inferRouterOutputs } from "@trpc/server";
import "server-only";

import { categoriesRouter } from "@/server/api/routers/categories";
import { tagsRouter } from "@/server/api/routers/tags";
import { videoRouter } from "@/server/api/routers/video";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  video: videoRouter,
  categories: categoriesRouter,
  tags: tagsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
export type RouterInput = inferRouterInputs<AppRouter>;
export type RouterOutput = inferRouterOutputs<AppRouter>;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
