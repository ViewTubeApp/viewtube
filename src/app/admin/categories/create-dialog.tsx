"use client";

import { log } from "@/utils/react/logger";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { type FC, type PropsWithChildren } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { type CreateCategory } from "@/server/db/schema/category";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const schema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
}) satisfies z.ZodType<CreateCategory>;

export const CreateCategoryDialog: FC<PropsWithChildren> = ({ children }) => {
  const form = useForm<CreateCategory>({
    mode: "all",
    resolver: zodResolver(schema),
    defaultValues: { name: "" },
  });

  const onSubmit = (values: CreateCategory) => {
    log.info("Creating category", values);
  };

  return (
    <Dialog>
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
          </form>
        </Form>
        <DialogFooter>
          <Button type="submit" disabled={!form.formState.isValid}>
            {form.formState.isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
