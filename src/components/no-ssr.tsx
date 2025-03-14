import dynamic from "next/dynamic";
import type { FC, PropsWithChildren } from "react";

const WithNoSSR: FC<PropsWithChildren> = ({ children }) => {
  return <>{children}</>;
};

export const NoSSR = dynamic(() => Promise.resolve(WithNoSSR), { ssr: false });
