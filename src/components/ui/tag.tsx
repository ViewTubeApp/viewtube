import { type FC, type PropsWithChildren } from "react";

import { Badge } from "./badge";

export const Tag: FC<PropsWithChildren> = ({ children }) => {
  return (
    <Badge variant="secondary" className="rounded-sm px-1 font-normal">
      {children}
    </Badge>
  );
};
