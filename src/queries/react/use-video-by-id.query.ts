import { api } from "@/trpc/react";
import { skipToken } from "@tanstack/react-query";
import { type inferReactQueryProcedureOptions } from "@trpc/react-query";

import { type AppRouter } from "@/server/api/root";

type QueryOptions = inferReactQueryProcedureOptions<AppRouter>["video"]["getVideoById"];

export function useVideoByIdQuery(id?: string, options?: QueryOptions) {
  return api.video.getVideoById.useQuery(id ? { id, related: true } : skipToken, options);
}
