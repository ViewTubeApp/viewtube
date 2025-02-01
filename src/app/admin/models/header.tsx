"use client";

import * as m from "@/paraglide/messages";
import { Plus } from "lucide-react";

import { Link } from "@/lib/i18n";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";

export function ModelsHeader() {
  return (
    <PageHeader
      title={m.models()}
      extra={
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/models/create">
            <Plus className="size-4" />
            {m.create_model()}
          </Link>
        </Button>
      }
    />
  );
}
