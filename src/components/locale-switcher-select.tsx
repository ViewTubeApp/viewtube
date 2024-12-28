"use client";

import { type Locale, usePathname, useRouter } from "@/i18n/routing";
import { useParams } from "next/navigation";
import { type FC, type PropsWithChildren, useCallback, useTransition } from "react";

import { Select, SelectContent, SelectTrigger, SelectValue } from "./ui/select";

interface LocaleSwitcherSelectProps extends PropsWithChildren {
  label: string;
  defaultValue: string;
}

export const LocaleSwitcherSelect: FC<LocaleSwitcherSelectProps> = ({ defaultValue, label, children }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();
  const params = useParams();

  const onSelectChange = useCallback(
    (value: string) => {
      const nextLocale = value as Locale;

      startTransition(() => {
        router.replace(
          // @ts-expect-error -- TypeScript will validate that only known `params`
          // are used in combination with a given `pathname`. Since the two will
          // always match for the current route, we can skip runtime checks.
          { pathname, params },
          { locale: nextLocale },
        );
      });
    },
    [router, pathname, params],
  );

  return (
    <Select value={defaultValue} onValueChange={onSelectChange}>
      <SelectTrigger disabled={isPending} className="h-8 w-32">
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent side="top">{children}</SelectContent>
    </Select>
  );
};
