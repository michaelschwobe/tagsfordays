import { useNavigate } from "@remix-run/react";
import { forwardRef } from "react";
import type { ButtonProps } from "~/components/ui/button";
import { Button } from "~/components/ui/button";
import { Icon } from "~/components/ui/icon";

export interface ButtonCancelProps
  extends Omit<
    ButtonProps,
    "children" | "onClick" | "size" | "type" | "variant"
  > {
  /** Sets the `class` attribute. */
  className?: string | undefined;
  /** Sets the content. */
  label?: string | undefined;
  /** Sets `navigate` params. **Required** */
  to?: string | undefined;
}

export const ButtonCancel = forwardRef<
  React.ElementRef<"button">,
  ButtonCancelProps
>(({ label, to, ...props }, forwardedRef) => {
  const navigate = useNavigate();

  return (
    <Button
      {...props}
      type="button"
      onClick={() => {
        if (to) {
          navigate(to);
        } else {
          navigate(-1);
        }
      }}
      size="md-icon"
      ref={forwardedRef}
    >
      <Icon type="x" />
      <span className="sr-only">{label ?? "Cancel"}</span>
    </Button>
  );
});

ButtonCancel.displayName = "ButtonCancel";
