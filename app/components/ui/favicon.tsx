import { forwardRef } from "react";
import { Icon } from "~/components/ui/icon";
import { cn } from "~/utils/misc";

export const Favicon = forwardRef<
  React.ElementRef<"img">,
  Omit<React.ComponentPropsWithoutRef<"img">, "children" | "src"> & {
    src: string | null | undefined;
  }
>(({ className, src, ...props }, ref) => {
  const classNames = cn("h-4 w-4", className);

  if (!src) {
    return <Icon type="bookmark" className={classNames} />;
  }

  return (
    <img
      alt=""
      {...props}
      src={src}
      width={16}
      height={16}
      className={classNames}
      ref={ref}
    />
  );
});
Favicon.displayName = "Favicon";
