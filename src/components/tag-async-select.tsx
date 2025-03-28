"use client";

import { api } from "@/trpc/react";
import { cn } from "@/utils/react/clsx";
import { Check, ChevronsUpDown, PlusCircle, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { type ReactNode, forwardRef, useState } from "react";
import { P, match } from "ts-pattern";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { Skeleton } from "./ui/skeleton";
import { Tag } from "./ui/tag";

interface TagAsyncSelectProps {
  value: string[];
  className?: string;
  onChange?: (value: string[]) => void;
}

export const TagAsyncSelect = forwardRef<HTMLButtonElement, TagAsyncSelectProps>(
  ({ value, onChange, className }, ref) => {
    const t = useTranslations();

    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");

    const { data, isFetched, isLoading } = api.tags.getTagList.useQuery({ query: search, limit: 32 });
    const tags = data?.data ?? [];

    const handleSelect = (tagName: string) => {
      onChange?.(
        match(value)
          .with([], () => [tagName])
          .with(
            P.when((tags) => tags.some((tag) => tag === tagName)),
            () => value.filter((tag) => tag !== tagName),
          )
          .otherwise(() => [...value, tagName]),
      );
    };

    const handleCreate = (name: string) => {
      onChange?.([...value, name]);
      setSearch("");
      setOpen(false);
    };

    const handleRemove = (tagName: string) => onChange?.(value.filter((name) => name !== tagName));

    const filteredTags = value.filter(
      (tag) => tag.toLowerCase().includes(search.toLowerCase()) && !tags.some((t) => t.name === tag),
    );

    const isCreating = filteredTags.length === 0 && search.length > 0;
    const isEmpty = filteredTags.length === 0 && tags.length === 0;

    let content: ReactNode = null;
    if (value.length === 0) {
      content = <span className="font-normal text-muted-foreground">{t("assign_tags")}</span>;
    } else {
      content = (
        <div className="flex flex-wrap gap-1">
          {value.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
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
              className={cn("group h-auto min-h-10 w-full !bg-input justify-between", value.length > 0 && "px-2 py-1")}
            >
              {content}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
            <Command>
              <CommandInput placeholder={t("search_tags")} value={search} onValueChange={setSearch} />
              <CommandList>
                <CommandEmpty className="py-2">
                  {match({ isFetched, isLoading, isCreating, isEmpty })
                    .with({ isLoading: true, isFetched: false }, () => <Skeleton className="mx-2 h-6" />)
                    .with({ isCreating: true }, () => (
                      <button
                        className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                        onClick={() => handleCreate(search)}
                      >
                        <PlusCircle className="h-4 w-4" />
                        {t("create_tag", { tag: search })}
                      </button>
                    ))
                    .with({ isEmpty: true }, () => (
                      <span className="ml-4 text-sm text-muted-foreground">{t("no_tags_found")}</span>
                    ))
                    .otherwise(() => null)}
                </CommandEmpty>
                <CommandGroup>
                  {filteredTags.map((tag) => (
                    <CommandItem key={tag} value={tag} onSelect={() => handleSelect(tag)}>
                      <Check className={cn("size-4", value.includes(tag) ? "opacity-100" : "opacity-0")} />
                      {tag}
                    </CommandItem>
                  ))}
                  {tags.map((tag) => (
                    <CommandItem key={tag.id} value={tag.name} onSelect={() => handleSelect(tag.name)}>
                      <Check className={cn("size-4", value.includes(tag.name) ? "opacity-100" : "opacity-0")} />
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
                  className="ml-1 rounded-full outline-hidden ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onClick={() => handleRemove(tag)}
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">{t("remove_tag", { tag })}</span>
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
