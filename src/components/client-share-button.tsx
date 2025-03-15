import { type ComponentProps, type FC } from "react";

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
export const ClientShareButton: FC<ClientShareButtonProps> = ({ url, ...props }) => {
  return <ShareButton url={url ?? window.location.href} {...props} />;
};
