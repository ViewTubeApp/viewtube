import { useTranslations } from "next-intl";
import { toast } from "sonner";

/**
 * Hook for working with copy and share functions.
 * @returns Object with copy and share functions.
 */
export function useShare() {
  const t = useTranslations();

  /**
   * Copies text to clipboard.
   * @param text Text to copy
   */
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(t("copy_success", { text }));
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      toast.error(t("copy_error"));
    }
  };

  /**
   * Shares URL via Web Share API or copies to clipboard if API is not supported.
   * @param url URL to share
   * @param title Title for sharing
   * @param description Description for sharing
   */
  const share = async (url: string, title: string, description: string | null) => {
    if (navigator.share) {
      try {
        await navigator.share({
          url,
          title,
          text: description ?? undefined,
        });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        console.error("Error sharing:", error);
        toast.error(t("share_error"));
        copy(url);
      }
    } else {
      console.error("Web Share API not supported");
      toast.error(t("share_error"));
      copy(url);
    }
  };

  return { copy, share };
}
