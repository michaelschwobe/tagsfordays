import { forwardRef } from "react";
import { Button } from "~/components/ui/button";
import { Icon } from "~/components/ui/icon";
import { cn } from "~/utils/misc";

export const ButtonColumnSort = forwardRef<
  React.ElementRef<typeof Button>,
  Omit<
    React.ComponentPropsWithoutRef<typeof Button>,
    "onClick" | "size" | "type" | "variant"
  > & {
    isSortedAsc: boolean;
    isSortedDesc: boolean;
    onClick: ((event: unknown) => void) | undefined;
  }
>(
  (
    { children, className, isSortedAsc, isSortedDesc, onClick, ...props },
    ref,
  ) => {
    return (
      <Button
        {...props}
        type="button"
        onClick={onClick}
        size={children ? "sm" : "sm-icon"}
        variant="ghost"
        className={cn(
          "flex cursor-pointer select-none overflow-hidden",
          className,
        )}
        ref={ref}
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
