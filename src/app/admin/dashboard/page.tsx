import * as m from "@/paraglide/messages";
import { CloudUpload } from "lucide-react";
import { type Metadata } from "next";

import { Link } from "@/lib/i18n";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";

import { DashboardVideoTable } from "./table";

export async function generateMetadata() {
  return { title: m.dashboard() } satisfies Metadata;
}

export default async function DashboardPage() {
  return (
    <div className="lg:container lg:mx-auto">
      <PageHeader
        title={m.dashboard()}
        extra={
          <Link href="/admin/upload">
            <Button variant="outline" size="sm">
              <CloudUpload className="size-4" />
              {m.upload_video()}
            </Button>
          </Link>
        }
      />
      <DashboardVideoTable />
    </div>
  );
}
