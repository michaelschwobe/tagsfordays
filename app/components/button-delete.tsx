import { conform } from "@conform-to/react";
import { useFetcher } from "@remix-run/react";
import { forwardRef } from "react";
import { Button } from "~/components/ui/button";
import { Icon } from "~/components/ui/icon";
import { useDoubleCheck } from "~/utils/misc";

export const ButtonDelete = forwardRef<
  React.ElementRef<typeof Button>,
  Omit<
    React.ComponentPropsWithoutRef<typeof Button>,
    "children" | "disabled" | "type" | "value"
  > & {
    formAction: string;
    idsSelected?: string[];
    label?: string | undefined;
  }
>(({ formAction, idsSelected, label, size, variant, ...props }, ref) => {
  const doubleCheck = useDoubleCheck();
  const fetcher = useFetcher();

  // Data states
  const isIdle = fetcher.state === "idle";
  const isPending = fetcher.state !== "idle";
  // const isClick0 = doubleCheck.isPending === false;
  const isClick1 = doubleCheck.isPending && isIdle;
  const isClick2 = doubleCheck.isPending && isPending;
  const isMultiple = Array.isArray(idsSelected) && idsSelected.length >= 1;

  // Input props
  const nextValue = isMultiple ? idsSelected : "";

  // Icon props
  const icon = isClick2 ? "loader" : isClick1 ? "alert-triangle" : "trash";

  // Text props
  const isIconOnly = size?.includes("icon") ?? false;
  const verb = isClick2 ? "Deleting" : isClick1 ? "Confirm delete" : "Delete";
  const text = label ? `${verb} ${label}` : verb;

  return (
    <fetcher.Form method="POST" action={formAction}>
      <input type="hidden" name={conform.INTENT} value="delete" hidden />
      <input type="hidden" name="ids-selected" value={nextValue} hidden />
      <Button
        {...doubleCheck.getButtonProps({ ...props })}
        type="submit"
        disabled={isPending}
        size={size}
        variant={isClick1 ? "filled-danger" : variant ?? "outlined-danger"}
        ref={ref}
      >
        <Icon type={icon} />
        <span className={isIconOnly ? "sr-only" : undefined}>{text}</span>
      </Button>
    </fetcher.Form>
  );
});
ButtonDelete.displayName = "ButtonDelete";
