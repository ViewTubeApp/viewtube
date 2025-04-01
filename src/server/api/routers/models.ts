import { createTRPCRouter } from "@/server/api/trpc";

import { createCreateModelProcedure } from "./procedures/models/create-model";
import { createDeleteModelProcedure } from "./procedures/models/delete-model";
import { createGetModelByIdProcedure } from "./procedures/models/get-model-by-id";
import { createGetModelListProcedure } from "./procedures/models/get-model-list";
import { createUpdateModelProcedure } from "./procedures/models/update-model";

export const modelsRouter = createTRPCRouter({
  getModelList: createGetModelListProcedure(),
  getModelById: createGetModelByIdProcedure(),
  createModel: createCreateModelProcedure(),
  updateModel: createUpdateModelProcedure(),
  deleteModel: createDeleteModelProcedure(),
});

export type * from "./procedures/models/get-model-list";
export type * from "./procedures/models/get-model-by-id";
export type * from "./procedures/models/create-model";
export type * from "./procedures/models/update-model";
export type * from "./procedures/models/delete-model";
