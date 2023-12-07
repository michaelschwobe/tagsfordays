import { forwardRef } from "react";
import { Button } from "~/components/ui/button";

export const ButtonPage = forwardRef<
  React.ElementRef<typeof Button>,
  Omit<React.ComponentPropsWithoutRef<typeof Button>, "children" | "type"> & {
    isCurrPage?: boolean | undefined;
    number: number;
  }
>(({ disabled, isCurrPage, number, size, ...props }, ref) => {
  const isIconOnly = size?.includes("icon") ?? false;
  return (
    <Button
      {...props}
      type={isCurrPage ? "button" : "submit"}
      disabled={disabled ? true : undefined}
      aria-disabled={isCurrPage ? true : undefined}
      size={size}
      ref={ref}
    >
      <span className={isIconOnly ? "sr-only" : undefined}>Page </span>
      {number}
    </Button>
  );
});
ButtonPage.displayName = "ButtonPage";
