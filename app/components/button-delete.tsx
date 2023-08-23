import { conform } from "@conform-to/react";
import { Form, useLocation, useNavigation } from "@remix-run/react";
import { forwardRef } from "react";
import { Button } from "~/components/ui/button";
import { Icon } from "~/components/ui/icon";
import { LinkButton } from "~/components/ui/link-button";
import { cn, useDoubleCheck } from "~/utils/misc";
import { USER_LOGIN_ROUTE, useOptionalUser } from "~/utils/user";

export interface ButtonDeleteProps
  extends Omit<React.ComponentPropsWithoutRef<"button">, "children"> {
  /** Sets the `class` attribute. */
  className?: string | undefined;
}

export const ButtonDelete = forwardRef<
  React.ElementRef<"button">,
  ButtonDeleteProps
>(({ className, onClick, ...props }, forwardedRef) => {
  const location = useLocation();
  const navigation = useNavigation();
  const optionalUser = useOptionalUser();
  const doubleCheck = useDoubleCheck();

  if (optionalUser) {
    return (
      <Form className={cn(className)} method="POST">
        <input type="hidden" name={conform.INTENT} value="delete" />
        <Button
          {...props}
          {...doubleCheck.getButtonProps({ type: "submit" })}
          ref={forwardedRef}
        >
          {!doubleCheck.isPending ? (
            <>
              <Icon type="trash-2" />
              <span className="sr-only">Delete</span>
            </>
          ) : null}
          {doubleCheck.isPending && navigation.state === "idle" ? (
            <>
              <Icon type="alert-triangle" />
              <Icon type="trash-2" />
              <span className="sr-only">Confirm Delete?</span>
            </>
          ) : null}
          {doubleCheck.isPending && navigation.state !== "idle" ? (
            <>
              <Icon type="loader" />
              <span className="sr-only">Deleting...</span>
            </>
          ) : null}
        </Button>
      </Form>
    );
  }

  return (
    <LinkButton to={`${USER_LOGIN_ROUTE}?redirectTo=${location.pathname}`}>
      <Icon type="trash-2" />
      <span className="sr-only">Delete</span>
    </LinkButton>
  );
});

ButtonDelete.displayName = "ButtonDelete";
