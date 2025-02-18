"use client";

import * as m from "@/paraglide/messages";
import { api } from "@/trpc/react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { type ReactNode, forwardRef, useState } from "react";
import { P, match } from "ts-pattern";

import { type ModelListElement } from "@/server/api/routers/models";

import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";

interface ModelAsyncSelectProps {
  value: Pick<ModelListElement, "id" | "name">[];
  className?: string;
  onChange?: (value: Pick<ModelListElement, "id" | "name">[]) => void;
}

export const ModelAsyncSelect = forwardRef<HTMLButtonElement, ModelAsyncSelectProps>(
  ({ value, className, onChange }, ref) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");

    const { data: models, isFetched, isLoading } = api.models.getModelList.useQuery({ query: search, limit: 128 });
    const isEmpty = models?.data.length === 0;

    const handleSelect = (model: Pick<ModelListElement, "id" | "name">) => {
      onChange?.(
        match(value)
          .with([], () => [model])
          .with(
            P.when((models) => models.some((m) => m.id === model.id)),
            () => value.filter((m) => m.id !== model.id),
          )
          .otherwise(() => [...value, model]),
      );
    };

    const handleRemove = (model: Pick<ModelListElement, "id" | "name">) => {
      onChange?.(value.filter((m) => m.id !== model.id));
    };

    let content: ReactNode = null;
    if (value.length === 0) {
      content = (
        <span className="font-normal text-muted-foreground group-hover:text-background">{m.assign_models()}</span>
      );
    } else {
      content = (
        <div className="flex flex-wrap gap-1">
          {value.map((model) => (
            <Badge key={model.id} variant="secondary" className="rounded-sm px-1 font-normal">
              {model.name}
            </Badge>
          ))}
        </div>
      );
    }

    return (
      <div className={cn("flex flex-col gap-2", className)}>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              ref={ref}
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className={cn("group h-auto min-h-10 w-full justify-between", value.length > 0 && "px-2 py-1")}
            >
              {content}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
            <Command>
              <CommandInput placeholder={m.search_models()} value={search} onValueChange={setSearch} />
              <CommandList>
                <CommandEmpty className="py-2">
                  {match({ isFetched, isLoading, isEmpty })
                    .with({ isLoading: true, isFetched: false }, () => <Skeleton className="mx-2 h-6" />)
                    .with({ isEmpty: true }, () => (
                      <span className="ml-4 text-sm text-muted-foreground">{m.no_models_found()}</span>
                    ))
                    .otherwise(() => null)}
                </CommandEmpty>
                <CommandGroup>
                  {models?.data.map((model) => (
                    <CommandItem key={model.id} value={model.name} onSelect={() => handleSelect(model)}>
                      <Check
                        className={cn("size-4", value.some((m) => m.id === model.id) ? "opacity-100" : "opacity-0")}
                      />
                      {model.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {value.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {value.map((model) => (
              <Badge key={model.id} variant="secondary">
                {model.name}
                <button
                  className="ml-1 rounded-full outline-hidden ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onClick={() => handleRemove(model)}
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">{m.remove_model({ model: model.name })}</span>
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>
    );
  },
);

ModelAsyncSelect.displayName = "CategoryAsyncSelect";
