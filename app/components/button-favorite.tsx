import { conform } from "@conform-to/react";
import { Form, useLocation, useNavigation } from "@remix-run/react";
import { forwardRef } from "react";
import type { ButtonVariants } from "~/components/ui/button";
import { Button } from "~/components/ui/button";
import { Icon } from "~/components/ui/icon";
import { LinkButton } from "~/components/ui/link-button";
import { cn } from "~/utils/misc";
import { USER_LOGIN_ROUTE, useOptionalUser } from "~/utils/user";

export interface ButtonFavoriteProps
  extends Omit<React.ComponentPropsWithoutRef<"button">, "children">,
    ButtonVariants {
  /** Sets the `class` attribute. */
  className?: string | undefined;
  /** Sets the input[name=id] `value` attribute. **Required** */
  entityId: string | undefined;
  /** Sets the input[name=favorite] `value` attribute. **Required** */
  entityValue: boolean | null;
}

export const ButtonFavorite = forwardRef<
  React.ElementRef<"button">,
  ButtonFavoriteProps
>(
  (
    {
      className,
      entityId,
      entityValue,
      size = "md-icon",
      variant = "outlined",
      ...props
    },
    forwardedRef,
  ) => {
    const location = useLocation();
    const navigation = useNavigation();
    const optionalUser = useOptionalUser();

    const isFav = entityValue === true;

    if (optionalUser) {
      return (
        <Form className={cn(className)} method="POST">
          <input type="hidden" name={conform.INTENT} value="favorite" />
          <input type="hidden" id="id" name="id" value={entityId} />
          <input type="hidden" name="favorite" value={String(!isFav)} />
          <Button
            {...props}
            type={navigation.state !== "idle" ? "button" : "submit"}
            size={size}
            variant={variant}
            ref={forwardedRef}
          >
            <Icon
              className={isFav ? "text-pink-600 dark:text-pink-500" : ""}
              type="heart"
            />
            <span className="sr-only">{isFav ? "Unfavorite" : "Favorite"}</span>
          </Button>
        </Form>
      );
    }

    return (
      <LinkButton
        to={`${USER_LOGIN_ROUTE}?redirectTo=${location.pathname}`}
        size={size}
        variant={variant}
      >
        <Icon
          className={isFav ? "text-pink-600 dark:text-pink-500" : ""}
          type="heart"
        />
        <span className="sr-only">{isFav ? "Unfavorite" : "Favorite"}</span>
      </LinkButton>
    );
  },
);

ButtonFavorite.displayName = "ButtonFavorite";
