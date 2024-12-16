"use client";

import { api } from "@/trpc/react";
import { Search } from "lucide-react";
import { motion } from "motion/react";
import { useQueryState } from "nuqs";
import { type ChangeEvent, type FC, useState } from "react";

import { GRID_QUERY_OPTIONS } from "@/constants/query";

import { IconButton } from "./icon-button";
import { Input } from "./ui/input";

export const SearchBar: FC = () => {
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
    <>
      <div className="ml-auto sm:hidden mr-4">
        <IconButton icon={Search} />
      </div>

      <div className="hidden sm:flex flex-1 items-center justify-end px-4">
        <motion.form
          initial={{ opacity: 0, y: -20, maxWidth: "28rem" }}
          animate={{ opacity: 1, y: 0, maxWidth: focused ? "36rem" : "28rem" }}
          className="w-full md:block"
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
    </>
  );
};
