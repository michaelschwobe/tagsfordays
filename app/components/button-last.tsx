import { forwardRef } from "react";
import { Button } from "~/components/ui/button";
import { Icon } from "~/components/ui/icon";

export interface ButtonLastProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof Button>,
    "children" | "type"
  > {
  /** Sets the `class` attribute. */
  className?: string | undefined;
}

export const ButtonLast = forwardRef<
  React.ElementRef<typeof Button>,
  ButtonLastProps
>(({ size, ...props }, ref) => {
  const isIconOnly = size?.includes("icon") ?? false;
  return (
    <Button {...props} type="submit" size={size} ref={ref}>
      <span className={isIconOnly ? "sr-only" : undefined}>Last page</span>
      <Icon type="chevrons-right" />
    </Button>
  );
});

ButtonLast.displayName = "ButtonLast";
