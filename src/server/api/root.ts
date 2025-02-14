import { type inferRouterInputs, type inferRouterOutputs } from "@trpc/server";
import "server-only";

import { categoriesRouter } from "./routers/categories";
import { commentsRouter } from "./routers/comments";
import { modelsRouter } from "./routers/models";
import { tagsRouter } from "./routers/tags";
import { videoRouter } from "./routers/video";
import { createCallerFactory, createTRPCRouter } from "./trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  video: videoRouter,
  categories: categoriesRouter,
  tags: tagsRouter,
  models: modelsRouter,
  comments: commentsRouter,
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
