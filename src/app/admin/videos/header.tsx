"use client";

import * as m from "@/paraglide/messages";
import { CloudUpload } from "lucide-react";
import { type FC } from "react";

import { Link } from "@/lib/i18n";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";

export const DashboardHeader: FC = () => {
  return (
    <PageHeader
      title={m.dashboard()}
      extra={
        <Link href="/admin/videos/create">
          <Button variant="outline" size="sm">
            <CloudUpload className="size-4" />
            {m.upload_video()}
          </Button>
        </Link>
      }
    />
  );
};
