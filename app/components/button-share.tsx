import { forwardRef } from "react";
import { Button } from "~/components/ui/button";
import { Icon } from "~/components/ui/icon";
import { asyncShare, cn } from "~/utils/misc";

export const ButtonShare = forwardRef<
  React.ElementRef<typeof Button>,
  Omit<
    React.ComponentPropsWithoutRef<typeof Button>,
    "children" | "onClick" | "size" | "type" | "value" | "variant"
  >
>(({ className, ...props }, ref) => {
  const isUnshareable = typeof document === "undefined" || !navigator.share;
  return (
    <Button
      {...props}
      type="button"
      onClick={async () => await asyncShare()}
      aria-disabled={isUnshareable}
      size="md-icon"
      className={cn(isUnshareable ? "opacity-50" : undefined, className)}
      ref={ref}
    >
      <Icon type="share-2" />
      <span className="sr-only">Share</span>
    </Button>
  );
});
ButtonShare.displayName = "ButtonShare";
