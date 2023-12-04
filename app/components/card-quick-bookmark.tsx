import { Form } from "@remix-run/react";
import { forwardRef, useId } from "react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "~/components/ui/card";
import { Code } from "~/components/ui/code";
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

interface CardQuickBookmarkProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "children"> {
  /** Sets the `class` attribute. */
  className?: string | undefined;
  /** Sets the "redirect" path. **Required** */
  redirectTo: string;
}

export const CardQuickBookmark = forwardRef<
  React.ElementRef<"div">,
  CardQuickBookmarkProps
>(({ className, redirectTo, ...props }, forwardedRef) => {
  const id = useId();
  const optionalUser = useOptionalUser();

  return (
    <Card
      {...props}
      className={cn(className)}
      data-testid="card-quick-bookmark"
      ref={forwardedRef}
    >
      <CardHeader>
        <H2>Quick Bookmark</H2>
      </CardHeader>
      {optionalUser ? (
        <CardContent>
          <Form method="POST" action="/bookmarks/new">
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
                <Button type="submit" variant="filled">
                  <Icon type="plus" />
                  <Icon type="bookmark" />
                  <span className="sr-only">Add bookmark</span>
                </Button>
              </FormControl>
              <FormDescription id={`${id}-url-description`}>
                Use secure URLs, ex: <Code>https://</Code>
              </FormDescription>
            </FormItem>
          </Form>
        </CardContent>
      ) : (
        <CardFooter>
          <LinkButton
            to={`${USER_LOGIN_ROUTE}?redirectTo=${redirectTo}`}
            className="max-sm:w-full"
          >
            <Icon type="log-in" />
            <span>Log in to use this feature</span>
          </LinkButton>
        </CardFooter>
      )}
    </Card>
  );
});

CardQuickBookmark.displayName = "CardQuickBookmark";
