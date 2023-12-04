import { forwardRef } from "react";
import { Button } from "~/components/ui/button";
import { Icon } from "~/components/ui/icon";

interface ButtonPrevProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof Button>,
    "children" | "type"
  > {
  /** Sets the `class` attribute. */
  className?: string | undefined;
}

export const ButtonPrev = forwardRef<
  React.ElementRef<typeof Button>,
  ButtonPrevProps
>(({ size, ...props }, ref) => {
  const isIconOnly = size?.includes("icon") ?? false;
  return (
    <Button {...props} type="submit" size={size} ref={ref}>
      <Icon type="chevron-left" />
      <span className={isIconOnly ? "sr-only" : undefined}>Previous page</span>
    </Button>
  );
});

ButtonPrev.displayName = "ButtonPrev";
