import { forwardRef } from "react";
import { Button } from "~/components/ui/button";

interface ButtonPageProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof Button>,
    "children" | "type"
  > {
  /** Sets the `class` attribute. */
  className?: string | undefined;
  /** Sets the `disabled` attribute. */
  disabled?: boolean | undefined;
  /** Sets the `class` attribute. */
  isCurrPage?: boolean | undefined;
  /** Sets the content. **Required** */
  number: number;
}

export const ButtonPage = forwardRef<
  React.ElementRef<typeof Button>,
  ButtonPageProps
>(({ disabled, isCurrPage, number, size, ...props }, ref) => {
  const isIconOnly = size?.includes("icon") ?? false;
  return (
    <Button
      {...props}
      type={isCurrPage ? "button" : "submit"}
      size={size}
      disabled={disabled ? true : undefined}
      aria-disabled={isCurrPage ? true : undefined}
      ref={ref}
    >
      <span className={isIconOnly ? "sr-only" : undefined}>Page </span>
      {number}
    </Button>
  );
});

ButtonPage.displayName = "ButtonPage";
