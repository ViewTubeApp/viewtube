import { type ReactNode } from "react";

interface LayoutProps {
  dialog: ReactNode;
  children: ReactNode;
}

export default function Layout({ dialog, children }: LayoutProps) {
  return (
    <>
      {dialog}
      {children}
    </>
  );
}
