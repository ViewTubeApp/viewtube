"use client";

import { Check, ChevronsUpDown, PlusCircle, X } from "lucide-react";
import { cn } from "@/lib/clsx";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { type Tag } from "@/server/db/schema";
import { useMemo, useState, useCallback } from "react";

interface TagSelectProps {
  value: string[];
  className?: string;
  availableTags?: Tag[];
  onValueChange?: (value: string[]) => void;
}

export function TagSelect({ value, onValueChange, availableTags = [], className }: TagSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [localTags, setLocalTags] = useState<string[]>([]);

  const allTags = useMemo(() => {
    const existingNames = availableTags.map((tag) => tag.name);
    return [...existingNames, ...localTags];
  }, [availableTags, localTags]);

  const selectedTags = useMemo(() => value, [value]);

  const buttonContent = useMemo(() => {
    if (selectedTags.length === 0) {
      return <span className="font-normal text-muted-foreground transition-colors group-hover:text-background">Assign tags...</span>;
    }

    return (
      <div className="flex flex-wrap gap-1">
        {selectedTags.map((tag) => (
          <Badge key={tag} variant="secondary" className="rounded-sm px-1 font-normal">
            {tag}
          </Badge>
        ))}
      </div>
    );
  }, [selectedTags]);

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
      setLocalTags((prev) => [...prev, name]);
      onValueChange?.([...value, name]);
      setSearch("");
      setOpen(false);
    },
    [value, onValueChange],
  );

  const handleRemoveTag = useCallback(
    (tagName: string) => {
      onValueChange?.(value.filter((name) => name !== tagName));
      setLocalTags((prev) => prev.filter((name) => name !== tagName));
    },
    [value, onValueChange],
  );

  const filteredTags = useMemo(() => {
    return allTags.filter((tag) => tag.toLowerCase().includes(search.toLowerCase()));
  }, [allTags, search]);

  const showCreateOption = useMemo(() => {
    if (!search) return false;
    return !allTags.some((tag) => tag.toLowerCase() === search.toLowerCase());
  }, [search, allTags]);

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("group h-auto min-h-10 w-full justify-between", selectedTags.length > 0 && "px-2 py-1")}
          >
            {buttonContent}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
          <Command>
            <CommandInput placeholder="Search tags..." value={search} onValueChange={setSearch} />
            <CommandList>
              <CommandEmpty>
                {showCreateOption ? (
                  <button
                    className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                    onClick={() => handleCreateTag(search)}
                  >
                    <PlusCircle className="h-4 w-4" />
                    Create &ldquo;{search}&rdquo;
                  </button>
                ) : (
                  "No tags found."
                )}
              </CommandEmpty>
              <CommandGroup>
                {filteredTags.map((tag) => (
                  <CommandItem key={tag} value={tag} onSelect={() => handleSelect(tag)}>
                    <Check className={cn("mr-2 h-4 w-4", value.includes(tag) ? "opacity-100" : "opacity-0")} />
                    {tag}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedTags.map((tag) => (
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
}
