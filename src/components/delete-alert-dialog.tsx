"use client";

import * as m from "@/paraglide/messages";
import { stopPropagation, withStopPropagation } from "@/utils/react/html";
import { type AlertDialogProps } from "@radix-ui/react-alert-dialog";
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

interface DeleteAlertDialogProps extends AlertDialogProps {
  trigger?: ReactNode;
  header?: ReactNode;
  onDelete?: () => void;
}

export const DeleteAlertDialog: FC<DeleteAlertDialogProps> = ({ trigger, header, onDelete, ...props }) => {
  return (
    <AlertDialog {...props}>
      {trigger && <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{header}</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={stopPropagation}>{m.cancel()}</AlertDialogCancel>
          <AlertDialogAction onClick={withStopPropagation(() => onDelete?.())}>{m.delete_str()}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
