import { forwardRef, useId } from "react";
import { Button } from "~/components/ui/button";
import { FormDescription } from "~/components/ui/form-description";
import { FormLabel } from "~/components/ui/form-label";
import { Icon } from "~/components/ui/icon";
import { Input } from "~/components/ui/input";
import { LinkButton } from "~/components/ui/link-button";
import { cn } from "~/utils/misc";
import { USER_LOGIN_ROUTE, useOptionalUser } from "~/utils/user";

export interface QuickTagProps
  extends Omit<React.ComponentPropsWithoutRef<"aside">, "children"> {
  /** Sets the `class` attribute. */
  className?: string | undefined;
}

export const QuickTag = forwardRef<React.ElementRef<"aside">, QuickTagProps>(
  ({ className, ...props }, forwardedRef) => {
    const id = useId();
    const optionalUser = useOptionalUser();

    const redirectTo = "/tags/new";

    return (
      <aside
        {...props}
        className={cn("flex flex-col gap-2", className)}
        ref={forwardedRef}
      >
        <h2 className="text-lg font-semibold">Quick Tag</h2>

        {optionalUser ? (
          <form method="POST" action={redirectTo}>
            <div className="flex flex-col gap-1">
              <FormLabel htmlFor={`${id}-name`}>Name</FormLabel>
              <div className="flex gap-2">
                <Input
                  className="w-full"
                  type="text"
                  id={`${id}-name`}
                  name="name"
                  autoComplete="false"
                  aria-describedby={`${id}-name-description`}
                />
                <Button type="submit">
                  <Icon type="check" />
                  <span className="sr-only">Add</span>
                </Button>
              </div>
              <FormDescription id={`${id}-name-description`}>
                Comma separate names, ex: <code>t1,t2,t3</code>
              </FormDescription>
            </div>
          </form>
        ) : (
          <div>
            <LinkButton to={`${USER_LOGIN_ROUTE}?redirectTo=${redirectTo}`}>
              <Icon type="log-in" />
              <span>Login to use this feature</span>
            </LinkButton>
          </div>
        )}
      </aside>
    );
  },
);

QuickTag.displayName = "QuickTag";
