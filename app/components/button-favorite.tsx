import { conform } from "@conform-to/react";
import { Form, useLocation, useNavigation } from "@remix-run/react";
import { forwardRef } from "react";
import { Button } from "~/components/ui/button";
import { Icon } from "~/components/ui/icon";
import { LinkButton } from "~/components/ui/link-button";
import { cn } from "~/utils/misc";
import { USER_LOGIN_ROUTE, useOptionalUser } from "~/utils/user";

export interface ButtonFavoriteProps
  extends Omit<React.ComponentPropsWithoutRef<"button">, "children"> {
  /** Sets the `class` attribute. */
  className?: string | undefined;
  /** Sets the input[name=id] `value` attribute. */
  entityId: string | undefined;
  /** Sets the input[name=favorite] `value` attribute. **Required** */
  entityValue: boolean | null;
}

export const ButtonFavorite = forwardRef<
  React.ElementRef<"button">,
  ButtonFavoriteProps
>(({ className, entityId, entityValue, ...props }, forwardedRef) => {
  const location = useLocation();
  const navigation = useNavigation();
  const optionalUser = useOptionalUser();

  const isFav = entityValue === true;

  if (optionalUser) {
    return (
      <Form className={cn(className)} method="POST">
        <input type="hidden" name={conform.INTENT} value="favorite" />
        <input type="hidden" id="id" name="id" value={entityId} />
        <input type="hidden" name="favorite" value={isFav ? "false" : "true"} />
        <Button
          {...props}
          type={navigation.state !== "idle" ? "button" : "submit"}
          ref={forwardedRef}
        >
          <Icon className={isFav ? "text-red-500" : ""} type="heart" />
          <span className="sr-only">Favorite</span>
        </Button>
      </Form>
    );
  }

  return (
    <LinkButton to={`${USER_LOGIN_ROUTE}?redirectTo=${location.pathname}`}>
      <Icon className={isFav ? "text-red-500" : ""} type="heart" />
      <span className="sr-only">Favorite</span>
    </LinkButton>
  );
});

ButtonFavorite.displayName = "ButtonFavorite";
