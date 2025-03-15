"use client";

import { api } from "@/trpc/react";
import { Search, XIcon } from "lucide-react";
import * as motion from "motion/react-client";
import { useTranslations } from "next-intl";
import { parseAsString, useQueryState } from "nuqs";
import { type FC, useEffect, useState } from "react";

import { cn } from "@/lib/utils";

import { motions } from "@/constants/motion";

import { IconButton } from "./icon-button";
import { Input } from "./ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { VisuallyHidden } from "./ui/visually-hidden";

interface SearchbarProps {
  className?: string;
}

export const Searchbar: FC<SearchbarProps> = ({ className }) => {
  const t = useTranslations();

  const utils = api.useUtils();

  const [open, setOpen] = useState(false);

  const [query, setQuery] = useQueryState(
    "q",
    parseAsString.withOptions({
      throttleMs: 100,
      clearOnDefault: true,
    }),
  );

  useEffect(() => {
    void utils.invalidate();
  }, [query, utils]);

  return (
    <>
      <div className={cn("ml-auto sm:hidden", className)}>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <IconButton
              className="size-8 lg:size-10"
              iconClassName="size-4 lg:size-5"
              icon={Search}
              onClick={() => setOpen(true)}
            />
          </SheetTrigger>
          <SheetContent side="top" className="h-full p-0 backdrop-blur-xl bg-transparent" close={false}>
            <VisuallyHidden>
              <SheetHeader>
                <SheetTitle>{t("search")}</SheetTitle>
              </SheetHeader>
            </VisuallyHidden>
            <motion.div
              className="h-full p-4"
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0.5, bottom: 0 }}
              onDragEnd={(_, info) => Math.abs(info.delta.y) >= 0 && Math.abs(info.velocity.y) > 16 && setOpen(false)}
            >
              <div className="flex gap-2">
                <Input
                  value={query ?? ""}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t("search_placeholder")}
                  className="w-full rounded-full bg-secondary pl-4 pr-10 transition-all focus:bg-background"
                />
                <IconButton icon={Search} onClick={() => setOpen(false)} />
              </div>
            </motion.div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="hidden sm:flex flex-1 items-center justify-end px-4 isolate">
        <motion.form {...motions.slide.y.in}>
          <div className="relative">
            <Input
              value={query ?? ""}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("search_placeholder")}
              className="w-[36ch] peer bg-secondary pl-2 pr-10 transition-all focus:bg-background placeholder-shown:w-[28ch] focus:w-[36ch]"
            />
            <XIcon
              onClick={() => setQuery("")}
              className="absolute cursor-pointer z-10 opacity-0 transition-opacity right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground peer-not-placeholder-shown:opacity-100"
            />
            <Search className="absolute opacity-100 transition-opacity right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground peer-not-placeholder-shown:opacity-0" />
          </div>
        </motion.form>
      </div>
    </>
  );
};
