import * as m from "@/paraglide/messages";
import { type Metadata } from "next";

import { DashboardHeader } from "./header";
import { DashboardVideoTable } from "./table";

export async function generateMetadata() {
  return { title: m.dashboard() } satisfies Metadata;
}

export default async function DashboardPage() {
  return (
    <div className="lg:container lg:mx-auto">
      <DashboardHeader />
      <DashboardVideoTable />
    </div>
  );
}
