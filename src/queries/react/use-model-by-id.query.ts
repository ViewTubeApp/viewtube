import { api } from "@/trpc/react";
import { skipToken } from "@tanstack/react-query";
import { type inferReactQueryProcedureOptions } from "@trpc/react-query";

import { type AppRouter } from "@/server/api/root";
import { type GetModelByIdSchema } from "@/server/api/routers/models";

type QueryOptions = inferReactQueryProcedureOptions<AppRouter>["models"]["getModelById"];

export function useModelByIdQuery(input: GetModelByIdSchema | undefined, options?: QueryOptions) {
  return api.models.getModelById.useQuery(input ?? skipToken, options);
}
