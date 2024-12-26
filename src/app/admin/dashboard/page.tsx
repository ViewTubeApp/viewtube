import { loadVideoList } from "@/queries/server/load-video-list";
import { CloudUpload } from "lucide-react";
import { type Metadata } from "next";
import Link from "next/link";

import { adminVideoListQueryOptions } from "@/constants/query";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";

import { DashboardVideoTable } from "./table";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const videos = await loadVideoList(adminVideoListQueryOptions);

  return (
    <div className="lg:container lg:mx-auto">
      <PageHeader
        title="Dashboard"
        extra={
          <Link href="/admin/upload">
            <Button variant="outline" size="sm">
              <CloudUpload className="size-4" /> Upload video
            </Button>
          </Link>
        }
      />
      <DashboardVideoTable videos={videos} />
    </div>
  );
}
