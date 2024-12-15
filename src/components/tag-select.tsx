"use client";

import { Check, ChevronsUpDown, PlusCircle, X } from "lucide-react";
import { cn } from "@/lib/clsx";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useMemo, useState, useCallback } from "react";

interface TagSelectProps {
  value: string[];
  className?: string;
  onValueChange?: (value: string[]) => void;
}

export function TagSelect({ value, onValueChange, className }: TagSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

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
    (tagName: string) => {
      onValueChange?.(value.filter((name) => name !== tagName));
    },
    [value, onValueChange],
  );

  const filteredTags = useMemo(() => {
    return value.filter((tag) => tag.toLowerCase().includes(search.toLowerCase()));
  }, [value, search]);

  const showCreateOption = useMemo(() => {
    if (!search) return false;
    return !value.some((tag) => tag.toLowerCase() === search.toLowerCase());
  }, [search, value]);

  const buttonContent = useMemo(() => {
    if (value.length === 0) {
      return <span className="font-normal text-muted-foreground">Assign tags...</span>;
    }

    return (
      <div className="flex flex-wrap gap-1">
        {value.map((tag) => (
          <Badge key={tag} variant="secondary" className="rounded-sm px-1 font-normal">
            {tag}
          </Badge>
        ))}
      </div>
    );
  }, [value]);

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("group h-auto min-h-10 w-full justify-between", value.length > 0 && "px-2 py-1")}
          >
            {buttonContent}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
          <Command>
            <CommandInput placeholder="Search tags..." value={search} onValueChange={setSearch} />
            <CommandList>
              <CommandEmpty className="py-2">
                {showCreateOption ? (
                  <button
                    className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                    onClick={() => handleCreateTag(search)}
                  >
                    <PlusCircle className="h-4 w-4" />
                    Create &ldquo;{search}&rdquo;
                  </button>
                ) : (
                  <span className="ml-4 text-sm text-muted-foreground">No tags found.</span>
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
}
