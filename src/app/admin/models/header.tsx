"use client";

import * as m from "@/paraglide/messages";
import { Plus } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";

import { CreateModelDialog } from "./dialog";

export function ModelsHeader() {
  return (
    <PageHeader
      title={m.models()}
      extra={
        <CreateModelDialog>
          <Button variant="outline" size="sm">
            <Plus className="size-4" />
            {m.create_model()}
          </Button>
        </CreateModelDialog>
      }
    />
  );
}
