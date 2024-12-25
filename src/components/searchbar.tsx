"use client";

import { api } from "@/trpc/react";
import { Search, XIcon } from "lucide-react";
import { motion } from "motion/react";
import { usePathname, useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { type ChangeEvent, type FC, useTransition } from "react";

import { publicVideoListQueryOptions } from "@/constants/query";

import { IconButton } from "./icon-button";
import { Input } from "./ui/input";

export const SearchBar: FC = () => {
  const utils = api.useUtils();

  const [, startTransition] = useTransition();

  const router = useRouter();
  const pathname = usePathname();

  const [query, setQuery] = useQueryState("q", {
    throttleMs: 100,
    defaultValue: "",
    clearOnDefault: true,
  });

  const handleChangeInput = async (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    const searchParams = await setQuery(value);
    await utils.video.getVideoList.invalidate({ ...publicVideoListQueryOptions, query: value });

    if (pathname !== "/" && value !== "") {
      startTransition(() => {
        router.push(`/?${searchParams}`);
      });
    }
  };

  const handleClearInput = async () => {
    await setQuery("");
    await utils.video.getVideoList.invalidate({ ...publicVideoListQueryOptions, query: "" });
  };

  return (
    <>
      <div className="ml-auto sm:hidden mr-4">
        <IconButton icon={Search} />
      </div>

      <div className="hidden sm:flex flex-1 items-center justify-end px-4 isolate">
        <motion.form initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="relative">
            <Input
              value={query ?? ""}
              onChange={handleChangeInput}
              placeholder="Search videos..."
              className="w-[36ch] peer bg-secondary pl-2 pr-10 transition-all duration-[250ms] focus:bg-background placeholder-shown:w-[28ch] focus:w-[36ch]"
            />
            <XIcon
              onClick={handleClearInput}
              className="absolute cursor-pointer z-10 opacity-0 transition-opacity duration-[250ms] right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground peer-[&:not(:placeholder-shown)]:opacity-100"
            />
            <Search className="absolute opacity-100 transition-opacity duration-[250ms] right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground peer-[&:not(:placeholder-shown)]:opacity-0" />
          </div>
        </motion.form>
      </div>
    </>
  );
};
