import { type ComponentProps } from "react";

import { cn } from "@/lib/utils";

type PageLayoutProps = ComponentProps<"main">;

export function PageLayout({ children, className, ...props }: PageLayoutProps) {
  return (
    <main {...props} className={cn("w-full flex flex-col max-h-screen max-w-full overflow-x-hidden", className)}>
      {children}
    </main>
  );
}

type PageContentProps = ComponentProps<"div">;

function PageContent({ children, className, ...props }: PageContentProps) {
  return (
    <div className={cn("relative p-2 sm:p-4 flex-1 overflow-y-auto", className)} {...props}>
      {children}
    </div>
  );
}

PageLayout.Content = PageContent;
