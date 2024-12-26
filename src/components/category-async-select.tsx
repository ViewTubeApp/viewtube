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
  value: Category[];
  className?: string;
  onChange?: (value: Category[]) => void;
}

export const CategoryAsyncSelect = forwardRef<HTMLButtonElement, CategoryAsyncSelectProps>(
  ({ value, className, onChange }, ref) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");

    const { data: categories = [], isFetched, isLoading } = useCategoryListQuery({ query: search });
    const isEmpty = categories.length === 0;

    const handleSelect = (category: Category) => {
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

    const handleRemove = (category: Category) => {
      onChange?.(value.filter((c) => c.id !== category.id));
    };

    let content: ReactNode = null;
    if (value.length === 0) {
      content = (
        <span className="font-normal text-muted-foreground group-hover:text-background">Assign categories...</span>
      );
    } else {
      content = (
        <div className="flex flex-wrap gap-1">
          {value.map((category) => (
            <Badge key={category.id} variant="secondary" className="rounded-sm px-1 font-normal">
              {category.name}
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
              <CommandInput placeholder="Search categories..." value={search} onValueChange={setSearch} />
              <CommandList>
                <CommandEmpty className="py-2">
                  {match({ isFetched, isLoading, isEmpty })
                    .with({ isLoading: true, isFetched: false }, () => <Skeleton className="h-6 w-full" />)
                    .with({ isEmpty: true }, () => (
                      <span className="ml-4 text-sm text-muted-foreground">No categories found.</span>
                    ))
                    .otherwise(() => null)}
                </CommandEmpty>
                <CommandGroup>
                  {categories.map((category) => (
                    <CommandItem key={category.id} value={category.name} onSelect={() => handleSelect(category)}>
                      <Check className={cn("size-4", value.includes(category) ? "opacity-100" : "opacity-0")} />
                      {category.name}
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
                {category.name}
                <button
                  className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onClick={() => handleRemove(category)}
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove {category.name}</span>
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