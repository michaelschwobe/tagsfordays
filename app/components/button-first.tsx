import { forwardRef } from "react";
import { Button } from "~/components/ui/button";
import { Icon } from "~/components/ui/icon";

interface ButtonFirstProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof Button>,
    "children" | "type"
  > {
  /** Sets the `class` attribute. */
  className?: string | undefined;
}

export const ButtonFirst = forwardRef<
  React.ElementRef<typeof Button>,
  ButtonFirstProps
>(({ size, ...props }, ref) => {
  const isIconOnly = size?.includes("icon") ?? false;
  return (
    <Button {...props} type="submit" size={size} ref={ref}>
      <Icon type="chevrons-left" />
      <span className={isIconOnly ? "sr-only" : undefined}>First page</span>
    </Button>
  );
});

ButtonFirst.displayName = "ButtonFirst";
