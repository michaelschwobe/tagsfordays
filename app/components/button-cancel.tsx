import { useNavigate } from "@remix-run/react";
import { forwardRef } from "react";
import { Button } from "~/components/ui/button";
import { Icon } from "~/components/ui/icon";

export const ButtonCancel = forwardRef<
  React.ElementRef<"button">,
  Omit<
    React.ComponentPropsWithoutRef<typeof Button>,
    "children" | "onClick" | "size" | "type" | "variant"
  > & {
    label?: string | undefined;
    to?: string | undefined;
  }
>(({ label, to, ...props }, ref) => {
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
      ref={ref}
    >
      <Icon type="x" />
      <span className="sr-only">{label ?? "Cancel"}</span>
    </Button>
  );
});
ButtonCancel.displayName = "ButtonCancel";
