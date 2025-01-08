"use client";

import * as m from "@/paraglide/messages";
import { type FC } from "react";

import { PageHeader } from "@/components/page-header";

export const TagsHeader: FC = () => {
  return <PageHeader title={m.tags()} />;
};
