"use client";

import { useTagListQuery } from "@/queries/react/use-tag-list.query";
import { cn } from "@/utils/shared/clsx";
import { Check, ChevronsUpDown, PlusCircle, X } from "lucide-react";
import { type ReactNode, forwardRef, useCallback, useMemo, useState } from "react";
import { match } from "ts-pattern";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { Skeleton } from "./ui/skeleton";

interface TagAsyncSelectProps {
  value: string[];
  className?: string;
  onValueChange?: (value: string[]) => void;
}

export const TagAsyncSelect = forwardRef<HTMLDivElement, TagAsyncSelectProps>(
  ({ value, onValueChange, className }, ref) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");

    const { data: tags = [], isFetched, isLoading } = useTagListQuery({ query: search });

    const handleSelect = useCallback(
      (tagName: string) => {
        if (value.includes(tagName)) {
          onValueChange?.(value.filter((name) => name !== tagName));
        } else {
          onValueChange?.([...value, tagName]);
        }
      },
      [value, onValueChange],
    );

    const handleCreateTag = useCallback(
      (name: string) => {
        onValueChange?.([...value, name]);
        setSearch("");
        setOpen(false);
      },
      [value, onValueChange],
    );

    const handleRemoveTag = useCallback(
      (tagName: string) => onValueChange?.(value.filter((name) => name !== tagName)),
      [value, onValueChange],
    );

    const filteredTags = useMemo(
      () =>
        value.filter((tag) => tag.toLowerCase().includes(search.toLowerCase()) && !tags.some((t) => t.name === tag)),
      [value, search, tags],
    );

    const isCreating = filteredTags.length === 0;
    const isEmpty = filteredTags.length === 0 && tags.length === 0;

    let content: ReactNode = null;
    if (value.length === 0) {
      content = <span className="font-normal text-muted-foreground group-hover:text-background">Assign tags...</span>;
    } else {
      content = (
        <div className="flex flex-wrap gap-1">
          {value.map((tag) => (
            <Badge key={tag} variant="secondary" className="rounded-sm px-1 font-normal">
              {tag}
            </Badge>
          ))}
        </div>
      );
    }

    return (
      <div className={cn("flex flex-col gap-2", className)} ref={ref}>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
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
              <CommandInput placeholder="Search tags..." value={search} onValueChange={setSearch} />
              <CommandList>
                <CommandEmpty className="py-2">
                  {match({ isFetched, isLoading, isCreating, isEmpty })
                    .with({ isLoading: true, isFetched: false }, () => <Skeleton className="h-6 w-full" />)
                    .with({ isCreating: true }, () => (
                      <button
                        className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                        onClick={() => handleCreateTag(search)}
                      >
                        <PlusCircle className="h-4 w-4" />
                        Create &ldquo;{search}&rdquo;
                      </button>
                    ))
                    .with({ isEmpty: true }, () => (
                      <span className="ml-4 text-sm text-muted-foreground">No tags found.</span>
                    ))
                    .otherwise(() => null)}
                </CommandEmpty>
                <CommandGroup>
                  {filteredTags.map((tag) => (
                    <CommandItem key={tag} value={tag} onSelect={() => handleSelect(tag)}>
                      <Check className={cn("mr-2 h-4 w-4", value.includes(tag) ? "opacity-100" : "opacity-0")} />
                      {tag}
                    </CommandItem>
                  ))}
                  {tags.map((tag) => (
                    <CommandItem key={tag.id} value={tag.name} onSelect={() => handleSelect(tag.name)}>
                      <Check className={cn("mr-2 h-4 w-4", value.includes(tag.name) ? "opacity-100" : "opacity-0")} />
                      {tag.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {value.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {value.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
                <button
                  className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onClick={() => handleRemoveTag(tag)}
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove {tag}</span>
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>
    );
  },
);

TagAsyncSelect.displayName = "TagAsyncSelect";
