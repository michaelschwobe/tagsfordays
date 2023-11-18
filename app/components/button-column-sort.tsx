import { forwardRef } from "react";
import { Button } from "~/components/ui/button";
import { Icon } from "~/components/ui/icon";
import { cn } from "~/utils/misc";

export interface ButtonColumnSortProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof Button>,
    "onClick" | "size" | "type" | "variant"
  > {
  /** Sets the icon type **Required** */
  isSortedAsc: boolean;
  /** Sets the icon type **Required** */
  isSortedDesc: boolean;
  /** Binds the `click` event handler. **Required** */
  onClick: ((event: unknown) => void) | undefined;
}

export const ButtonColumnSort = forwardRef<
  React.ElementRef<typeof Button>,
  ButtonColumnSortProps
>(
  (
    { children, className, isSortedAsc, isSortedDesc, onClick, ...props },
    forwardedRef,
  ) => {
    return (
      <Button
        {...props}
        type="button"
        onClick={onClick}
        variant="ghost"
        size={children ? "sm" : "sm-icon"}
        className={cn(
          "flex cursor-pointer select-none overflow-hidden",
          className,
        )}
        ref={forwardedRef}
      >
        {children}
        <Icon
          type={
            isSortedAsc
              ? "chevron-up"
              : isSortedDesc
                ? "chevron-down"
                : "chevrons-up-down"
          }
        />
      </Button>
    );
  },
);

ButtonColumnSort.displayName = "ButtonColumnSort";
