import { languageTag } from "@/paraglide/runtime";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import { enUS, ru } from "date-fns/locale";
import { match } from "ts-pattern";

export function useFormattedDistance() {
  return (timestamp: Date) =>
    formatDistanceToNow(timestamp, {
      addSuffix: true,
      locale: match(languageTag())
        .with("ru", () => ru)
        .with("en", () => enUS)
        .exhaustive(),
    });
}
