import { forwardRef, useId } from "react";
import { Button } from "~/components/ui/button";
import { FormControl } from "~/components/ui/form-control";
import { FormDescription } from "~/components/ui/form-description";
import { FormItem } from "~/components/ui/form-item";
import { FormLabel } from "~/components/ui/form-label";
import { H2 } from "~/components/ui/h2";
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
      <H2>Quick Bookmark</H2>

      {optionalUser ? (
        <form method="POST" action={redirectTo}>
          <FormItem>
            <FormLabel htmlFor={`${id}-url`}>URL</FormLabel>
            <FormControl>
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
            </FormControl>
            <FormDescription id={`${id}-url-description`}>
              Use secure URLs, ex: <code>https://</code>
            </FormDescription>
          </FormItem>
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
