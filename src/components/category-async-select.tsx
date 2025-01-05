import * as m from "@/paraglide/messages";
import { useCategoryListQuery } from "@/queries/react/use-category-list.query";
import { cn } from "@/utils/shared/clsx";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { type ReactNode, forwardRef, useState } from "react";
import { P, match } from "ts-pattern";

import { type Category } from "@/server/db/schema";

import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Skeleton } from "./ui/skeleton";

interface CategoryAsyncSelectProps {
  value: Pick<Category, "id" | "slug">[];
  className?: string;
  onChange?: (value: Pick<Category, "id" | "slug">[]) => void;
}

export const CategoryAsyncSelect = forwardRef<HTMLButtonElement, CategoryAsyncSelectProps>(
  ({ value, className, onChange }, ref) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");

    const { data: categories, isFetched, isLoading } = useCategoryListQuery({ query: search, limit: 128 });
    const isEmpty = categories?.data.length === 0;

    const handleSelect = (category: Pick<Category, "id" | "slug">) => {
      onChange?.(
        match(value)
          .with([], () => [category])
          .with(
            P.when((categories) => categories.some((c) => c.id === category.id)),
            () => value.filter((c) => c.id !== category.id),
          )
          .otherwise(() => [...value, category]),
      );
    };

    const handleRemove = (category: Pick<Category, "id" | "slug">) => {
      onChange?.(value.filter((c) => c.id !== category.id));
    };

    let content: ReactNode = null;
    if (value.length === 0) {
      content = (
        <span className="font-normal text-muted-foreground group-hover:text-background">{m.assign_categories()}</span>
      );
    } else {
      content = (
        <div className="flex flex-wrap gap-1">
          {value.map((category) => (
            <Badge key={category.id} variant="secondary" className="rounded-sm px-1 font-normal">
              {category.slug}
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
              <CommandInput placeholder={m.search_categories()} value={search} onValueChange={setSearch} />
              <CommandList>
                <CommandEmpty className="py-2">
                  {match({ isFetched, isLoading, isEmpty })
                    .with({ isLoading: true, isFetched: false }, () => <Skeleton className="mx-2 h-6" />)
                    .with({ isEmpty: true }, () => (
                      <span className="ml-4 text-sm text-muted-foreground">{m.no_categories_found()}</span>
                    ))
                    .otherwise(() => null)}
                </CommandEmpty>
                <CommandGroup>
                  {categories?.data.map((category) => (
                    <CommandItem key={category.id} value={category.slug} onSelect={() => handleSelect(category)}>
                      <Check
                        className={cn("size-4", value.some((c) => c.id === category.id) ? "opacity-100" : "opacity-0")}
                      />
                      {category.slug}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {value.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {value.map((category) => (
              <Badge key={category.id} variant="secondary">
                {category.slug}
                <button
                  className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onClick={() => handleRemove(category)}
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">{m.remove_slug({ slug: category.slug })}</span>
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>
    );
  },
);

CategoryAsyncSelect.displayName = "CategoryAsyncSelect";
