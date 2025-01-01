"use client";

import * as m from "@/paraglide/messages";
import { useCategoryByIdQuery } from "@/queries/react/use-category-by-id.query";
import { useCreateCategoryMutation } from "@/queries/react/use-create-category.mutation";
import { useUpdateCategoryMutation } from "@/queries/react/use-update-category.mutation";
import { log } from "@/utils/react/logger";
import { parseAsBoolean, parseAsString, useQueryStates } from "nuqs";
import { type FC, type PropsWithChildren } from "react";

import { type CreateCategorySchema } from "@/server/api/routers/categories";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

import { CreateCategoryForm } from "./form";

export const CreateCategoryDialog: FC<PropsWithChildren> = ({ children }) => {
  const [state, setState] = useQueryStates({
    id: parseAsString,
    edit: parseAsBoolean.withDefault(false),
    create: parseAsBoolean.withDefault(false),
  });

  const { data: category, isLoading, isFetched } = useCategoryByIdQuery(state.id ? { id: state.id } : undefined);
  const { mutateAsync: createCategory } = useCreateCategoryMutation();
  const { mutateAsync: updateCategory } = useUpdateCategoryMutation();

  const onSubmit = (values: CreateCategorySchema) => {
    log.debug("Creating category", values);

    if (state.edit && state.id) {
      return updateCategory({ id: state.id, ...values }).then(() => setState({ edit: false }));
    }

    return createCategory(values).then(() => setState({ create: false }));
  };

  return (
    <Dialog
      open={state.create || state.edit}
      onOpenChange={(open) => setState({ id: null, edit: false, create: open })}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{m.create_category()}</DialogTitle>
          <DialogDescription>{m.create_category_description()}</DialogDescription>
        </DialogHeader>
        {state.edit && isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-10" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-80" />
            <Skeleton className="h-10 ml-auto w-24" />
          </div>
        )}
        {(state.create || isFetched) && <CreateCategoryForm defaultValues={category} onSubmit={onSubmit} />}
      </DialogContent>
    </Dialog>
  );
};
