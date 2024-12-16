"use client";

import { useQueryState } from "nuqs";
import { Search } from "lucide-react";
import { motion } from "motion/react";
import { Input } from "./ui/input";
import { useState, type ChangeEvent } from "react";
import { api } from "@/trpc/react";
import { GRID_QUERY_OPTIONS } from "@/constants/query";

function DesktopSearchBar() {
  const utils = api.useUtils();
  const [focused, setFocused] = useState(false);

  const [query, setQuery] = useQueryState("q", {
    throttleMs: 100,
    defaultValue: "",
    clearOnDefault: true,
  });

  const handleChangeInput = async (event: ChangeEvent<HTMLInputElement>) => {
    await setQuery(event.target.value);
    await utils.video.getVideoList.invalidate({ ...GRID_QUERY_OPTIONS, query: event.target.value });
  };

  return (
    <div className="flex flex-1 items-center justify-end px-4">
      <motion.form
        initial={{ opacity: 0, y: -20, maxWidth: "28rem" }}
        animate={{ opacity: 1, y: 0, maxWidth: focused ? "36rem" : "28rem" }}
        className="hidden w-full md:block"
      >
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={query ?? ""}
            onChange={handleChangeInput}
            placeholder="Search videos..."
            className="w-full bg-secondary pl-8 transition-colors focus:bg-background"
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
        </div>
      </motion.form>
    </div>
  );
}

function MobileSearchBar() {
  const [query, setQuery] = useQueryState("q", {
    throttleMs: 100,
    defaultValue: "",
    clearOnDefault: true,
  });

  const handleChangeInput = async (event: ChangeEvent<HTMLInputElement>) => {
    await setQuery(event.target.value);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="border-t p-2 md:hidden"
    >
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          value={query ?? ""}
          onChange={handleChangeInput}
          placeholder="Search videos..."
          className="w-full bg-secondary pl-8 transition-colors focus:bg-background"
        />
      </div>
    </motion.div>
  );
}

export const SearchBar = {
  Desktop: DesktopSearchBar,
  Mobile: MobileSearchBar,
} as const;
