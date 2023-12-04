import { conform } from "@conform-to/react";
import { useFetcher } from "@remix-run/react";
import { forwardRef } from "react";
import { Button } from "~/components/ui/button";
import { Icon } from "~/components/ui/icon";
import { cn } from "~/utils/misc";

export interface ButtonFavoriteProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof Button>,
    "children" | "type" | "value"
  > {
  /** Sets the form `action` attribute. **Required** */
  formAction: string;
  /** Sets the input[hidden] `value` attribute. */
  idsSelected?: string[];
  /** Sets the icon type **Required** */
  isFavorite: boolean;
  /** Sets the content. */
  label?: string | undefined;
}

export const ButtonFavorite = forwardRef<
  React.ElementRef<typeof Button>,
  ButtonFavoriteProps
>(
  (
    { className, formAction, idsSelected, isFavorite, label, size, ...props },
    forwardedRef,
  ) => {
    const fetcher = useFetcher();

    // Data states
    const isPending = fetcher.state !== "idle";
    const isFavorited = fetcher.formData
      ? fetcher.formData.get("favorite") === "true"
      : isFavorite === true;
    const isMultiple = Array.isArray(idsSelected) && idsSelected.length >= 1;

    // Input props
    const nextName = isMultiple ? "ids-selected" : "favorite";
    const nextValue = isMultiple ? idsSelected : String(!isFavorited);

    // Text props
    const isIconOnly = size?.includes("icon") ?? false;
    const verb = isMultiple
      ? "(Un)favorite"
      : isFavorited
        ? "Unfavorite"
        : "Favorite";
    const text = label ? `${verb} ${label}` : verb;

    return (
      <fetcher.Form method="POST" action={formAction}>
        <input type="hidden" name={conform.INTENT} value="favorite" hidden />
        <input type="hidden" name={nextName} value={nextValue} hidden />
        <Button
          {...props}
          type="submit"
          disabled={isPending}
          size={size}
          className={cn("disabled:opacity-100", className)}
          ref={forwardedRef}
        >
          <Icon
            type="heart"
            className={
              isFavorited ? "text-pink-600 dark:text-pink-500" : undefined
            }
            fill={isFavorited ? "currentColor" : "none"}
          />
          <span className={isIconOnly ? "sr-only" : undefined}>{text}</span>
        </Button>
      </fetcher.Form>
    );
  },
);

ButtonFavorite.displayName = "ButtonFavorite";
