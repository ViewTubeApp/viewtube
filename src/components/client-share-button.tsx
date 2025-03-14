import { ComponentProps, FC } from "react";

import { NoSSR } from "./no-ssr";
import { ShareButton } from "./share-button";

type ClientShareButtonProps = Omit<ComponentProps<typeof ShareButton>, "url"> & {
  /**
   * URL to share
   * @default window.location.href
   */
  url?: string;
};

/**
 * Client-side share button.
 *
 * Always wrap in `NoSSR` component!
 */
export const ClientShareButton: FC<ClientShareButtonProps> = ({ url, title, description }) => {
  return <ShareButton url={url ?? window.location.href} title={title} description={description} />;
};
