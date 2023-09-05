import { conform } from "@conform-to/react";
import { Form, useLocation, useNavigation } from "@remix-run/react";
import { forwardRef } from "react";
import type { ButtonVariants } from "~/components/ui/button";
import { Button } from "~/components/ui/button";
import { Icon } from "~/components/ui/icon";
import { LinkButton } from "~/components/ui/link-button";
import { cn, useDoubleCheck } from "~/utils/misc";
import { USER_LOGIN_ROUTE, useOptionalUser } from "~/utils/user";

export interface ButtonDeleteProps
  extends Omit<React.ComponentPropsWithoutRef<"button">, "children">,
    ButtonVariants {
  /** Sets the `class` attribute. */
  className?: string | undefined;
  /** Sets the content. **Required** */
  singular: string;
}

export const ButtonDelete = forwardRef<
  React.ElementRef<"button">,
  ButtonDeleteProps
>(
  (
    {
      className,
      onClick,
      singular,
      size = "md",
      variant = "outlined-danger",
      ...props
    },
    forwardedRef,
  ) => {
    const location = useLocation();
    const navigation = useNavigation();
    const optionalUser = useOptionalUser();
    const doubleCheck = useDoubleCheck();

    if (optionalUser) {
      const isIdle = !doubleCheck.isPending;
      const isClick1 = doubleCheck.isPending && navigation.state === "idle";
      const isClick2 = doubleCheck.isPending && navigation.state !== "idle";

      return (
        <Form method="POST">
          <input type="hidden" name={conform.INTENT} value="delete" />
          <Button
            {...doubleCheck.getButtonProps({ ...props, type: "submit" })}
            className={cn(className)}
            size={size}
            variant={isClick1 ? "filled-danger" : variant}
            ref={forwardedRef}
          >
            {isIdle ? (
              <>
                <Icon type="trash-2" />
                <span>Delete {singular}</span>
              </>
            ) : null}
            {isClick1 ? (
              <>
                <Icon type="alert-triangle" />
                <span>Delete {singular}?</span>
              </>
            ) : null}
            {isClick2 ? (
              <>
                <Icon type="loader" />
                <span>Deleting {singular}&hellip;</span>
              </>
            ) : null}
          </Button>
        </Form>
      );
    }

    return (
      <LinkButton
        to={`${USER_LOGIN_ROUTE}?redirectTo=${location.pathname}`}
        className={cn(className)}
        size={size}
        variant={variant}
      >
        <Icon type="trash-2" />
        <span>Delete {singular}</span>
      </LinkButton>
    );
  },
);

ButtonDelete.displayName = "ButtonDelete";
