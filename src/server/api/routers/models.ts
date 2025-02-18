import { createTRPCRouter } from "@/server/api/trpc";

import { createCreateModelProcedure } from "./procedures/models/createModel";
import { createDeleteModelProcedure } from "./procedures/models/deleteModel";
import { createGetModelByIdProcedure } from "./procedures/models/getModelById";
import { createGetModelListProcedure } from "./procedures/models/getModelList";
import { createUpdateModelProcedure } from "./procedures/models/updateModel";

export const modelsRouter = createTRPCRouter({
  getModelList: createGetModelListProcedure(),
  getModelById: createGetModelByIdProcedure(),
  createModel: createCreateModelProcedure(),
  updateModel: createUpdateModelProcedure(),
  deleteModel: createDeleteModelProcedure(),
});

export type * from "./procedures/models/getModelList";
export type * from "./procedures/models/getModelById";
export type * from "./procedures/models/createModel";
export type * from "./procedures/models/updateModel";
export type * from "./procedures/models/deleteModel";
