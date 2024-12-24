"use client";

import { useDeleteVideoMutation } from "@/queries/react/use-delete-video-mutation";
import { stopPropagation, withStopPropagation } from "@/utils/react/html";
import { Trash2Icon } from "lucide-react";
import { type FC, type ReactNode } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";

interface DeleteAlertDialogProps {
  videoId: string;
  label?: ReactNode;
}

export const DeleteAlertDialog: FC<DeleteAlertDialogProps> = ({ videoId, label }) => {
  const { mutate: deleteVideo } = useDeleteVideoMutation();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" onClick={stopPropagation}>
          <Trash2Icon className="h-4 w-4" /> {label}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to delete this video?</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={stopPropagation}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={withStopPropagation(() => deleteVideo({ id: videoId }))}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
