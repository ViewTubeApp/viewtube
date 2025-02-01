"use client";

import { useFormattedDistance } from "@/hooks/use-formatted-distance";
import * as m from "@/paraglide/messages";
import { type FC } from "react";

import { type Model } from "@/server/db/schema";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { ModelRowActions } from "./actions";

interface ModelCardProps {
  item: Model;
}

export const ModelCard: FC<ModelCardProps> = ({ item }) => {
  const formattedDistance = useFormattedDistance();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <p className="text-sm font-medium leading-none">{item.name}</p>
        </div>
        <ModelRowActions model={item} />
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-2">
          <div className="flex items-center">
            <span className="text-sm text-muted-foreground">
              {m.created_at({ date: formattedDistance(item.createdAt) })}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
