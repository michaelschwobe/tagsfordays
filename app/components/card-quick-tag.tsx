import { Form, useLocation } from "@remix-run/react";
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

export const CardQuickTag = forwardRef<
  React.ElementRef<"div">,
  Omit<React.ComponentPropsWithoutRef<"div">, "children"> & {
    redirectTo: string;
  }
>(({ className, redirectTo, ...props }, ref) => {
  const id = useId();
  const location = useLocation();
  const optionalUser = useOptionalUser();

  return (
    <Card
      {...props}
      className={cn(className)}
      data-testid="card-quick-tag"
      ref={ref}
    >
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
                  type="text"
                  id={`${id}-name`}
                  name="name"
                  autoComplete="false"
                  aria-describedby={`${id}-name-description`}
                  className="w-full"
                />
                <Button type="submit" variant="filled">
                  <Icon type="plus" />
                  <Icon type="tag" />
                  <span className="sr-only">Add tag</span>
                </Button>
              </FormControl>
              <FormDescription id={`${id}-name-description`}>
                Comma separate names, ex: <Code>t1,t2,t3</Code>
              </FormDescription>
            </FormItem>
          </Form>
        </CardContent>
      ) : (
        <CardFooter>
          <LinkButton
            to={`${USER_LOGIN_ROUTE}?redirectTo=${location.pathname}`}
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
CardQuickTag.displayName = "CardQuickTag";
