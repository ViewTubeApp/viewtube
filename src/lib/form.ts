import { createFormHook, createFormHookContexts } from "@tanstack/react-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export const { fieldContext, formContext, useFieldContext, useFormContext } = createFormHookContexts();

export const { useAppForm } = createFormHook({
  fieldComponents: {
    Input,
    Textarea,
    Select,
  },
  formComponents: {
    Button,
  },
  fieldContext,
  formContext,
});
