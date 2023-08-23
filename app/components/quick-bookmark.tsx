import { forwardRef, useId } from "react";
import { Button } from "~/components/ui/button";
import { FormDescription } from "~/components/ui/form-description";
import { FormLabel } from "~/components/ui/form-label";
import { Icon } from "~/components/ui/icon";
import { Input } from "~/components/ui/input";
import { LinkButton } from "~/components/ui/link-button";
import { cn } from "~/utils/misc";
import { USER_LOGIN_ROUTE, useOptionalUser } from "~/utils/user";

export interface QuickBookmarkProps
  extends Omit<React.ComponentPropsWithoutRef<"aside">, "children"> {
  /** Sets the `class` attribute. */
  className?: string | undefined;
}

export const QuickBookmark = forwardRef<
  React.ElementRef<"aside">,
  QuickBookmarkProps
>(({ className, ...props }, forwardedRef) => {
  const id = useId();
  const optionalUser = useOptionalUser();

  const redirectTo = "/bookmarks/new";

  return (
    <aside
      {...props}
      className={cn("flex flex-col gap-2", className)}
      ref={forwardedRef}
    >
      <h2 className="text-lg font-semibold">Quick Bookmark</h2>

      {optionalUser ? (
        <form method="POST" action={redirectTo}>
          <div className="flex flex-col gap-1">
            <FormLabel htmlFor={`${id}-url`}>URL</FormLabel>
            <div className="flex gap-2">
              <Input
                className="w-full"
                type="text"
                id={`${id}-url`}
                name="url"
                autoComplete="false"
                aria-describedby={`${id}-url-description`}
              />
              <Button type="submit">
                <Icon type="check" />
                <span className="sr-only">Add</span>
              </Button>
            </div>
            <FormDescription id={`${id}-url-description`}>
              Use secure URLs, ex: <code>https://</code>
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
});

QuickBookmark.displayName = "QuickBookmark";
