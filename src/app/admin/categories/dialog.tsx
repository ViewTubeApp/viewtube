"use client";

import { useCreateCategoryMutation } from "@/queries/react/use-create-category.mutation";
import { log } from "@/utils/react/logger";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { type FC, type PropsWithChildren, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { type CreateCategorySchema } from "@/server/api/routers/categories";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const schema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
}) satisfies z.ZodType<CreateCategorySchema>;

export const CreateCategoryDialog: FC<PropsWithChildren> = ({ children }) => {
  const [open, setOpen] = useState(false);

  const form = useForm<CreateCategorySchema>({
    mode: "all",
    resolver: zodResolver(schema),
    defaultValues: { name: "" },
  });

  const { mutateAsync } = useCreateCategoryMutation();

  const onSubmit = (values: CreateCategorySchema) => {
    log.debug("Creating category", values);
    return mutateAsync(values).then(() => setOpen(false));
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.reset();
    }

    setOpen(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create category</DialogTitle>
          <DialogDescription>Create a new category</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="submit"
                disabled={!form.formState.isValid || !form.formState.isDirty || form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ?
                  <Loader2 className="size-4 animate-spin" />
                : <Save className="size-4" />}{" "}
                Save
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
