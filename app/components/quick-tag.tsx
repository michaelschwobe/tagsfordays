import { Form, useLocation } from "@remix-run/react";
import { forwardRef, useId } from "react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "~/components/ui/card";
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

export interface QuickTagProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "children"> {
  /** Sets the `class` attribute. */
  className?: string | undefined;
  /** Sets the "redirect" path. **Required** */
  redirectTo: string;
}

export const QuickTag = forwardRef<React.ElementRef<"div">, QuickTagProps>(
  ({ className, redirectTo, ...props }, forwardedRef) => {
    const id = useId();
    const location = useLocation();
    const optionalUser = useOptionalUser();

    return (
      <Card {...props} className={cn(className)} ref={forwardedRef}>
        <CardHeader>
          <H2>Quick Tag</H2>
        </CardHeader>
        {optionalUser ? (
          <CardContent>
            <Form method="POST" action="/tags/new">
              <FormItem>
                <FormLabel htmlFor={`${id}-name`}>Name</FormLabel>
                <FormControl>
                  <Input
                    className="w-full"
                    type="text"
                    id={`${id}-name`}
                    name="name"
                    autoComplete="false"
                    aria-describedby={`${id}-name-description`}
                  />
                  <Button type="submit" variant="filled">
                    <Icon type="plus" />
                    <Icon type="tag" />
                    <span className="sr-only">Add tag</span>
                  </Button>
                </FormControl>
                <FormDescription id={`${id}-name-description`}>
                  Comma separate names, ex:{" "}
                  <code className="text-black">t1,t2,t3</code>
                </FormDescription>
              </FormItem>
            </Form>
          </CardContent>
        ) : (
          <CardFooter>
            <LinkButton
              className="max-sm:w-full"
              to={`${USER_LOGIN_ROUTE}?redirectTo=${location.pathname}`}
            >
              <Icon type="log-in" />
              <span>Login to use this feature</span>
            </LinkButton>
          </CardFooter>
        )}
      </Card>
    );
  },
);

QuickTag.displayName = "QuickTag";
