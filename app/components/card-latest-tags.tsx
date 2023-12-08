import { forwardRef } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "~/components/ui/card";
import { H2 } from "~/components/ui/h2";
import { Icon } from "~/components/ui/icon";
import { LinkButton } from "~/components/ui/link-button";
import type { loader as loaderIndex } from "~/routes/_index";
import { cn } from "~/utils/misc";
import { USER_LOGIN_ROUTE } from "~/utils/user";

export const CardLatestTags = forwardRef<
  React.ElementRef<"div">,
  Omit<React.ComponentPropsWithoutRef<"div">, "children"> & {
    data: Awaited<
      ReturnType<Awaited<ReturnType<typeof loaderIndex>>["json"]>
    >["tagsLatest"];
  }
>(({ className, data, ...props }, ref) => {
  return (
    <Card
      {...props}
      className={cn(className)}
      data-testid="card-latest-tags"
      ref={ref}
    >
      <CardHeader>
        <H2>Latest Tags</H2>
      </CardHeader>
      {data.length > 0 ? (
        <>
          <CardContent>
            <ul className="flex flex-wrap gap-2">
              {data.map((tag) => (
                <li key={tag.id}>
                  <LinkButton
                    to={`/tags/${tag.id}`}
                    size="sm"
                    className="max-w-[11rem]"
                  >
                    <Icon type="tag" />
                    <span className="truncate">{tag.name}</span>
                  </LinkButton>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter className="mt-auto">
            <LinkButton to="/tags" variant="filled" className="max-sm:w-full">
              <Icon type="tags" />
              <span>View all tags</span>
            </LinkButton>
          </CardFooter>
        </>
      ) : (
        <>
          <CardContent>
            <p>None found.</p>
          </CardContent>
          <CardFooter className="mt-auto">
            <LinkButton
              to={`${USER_LOGIN_ROUTE}?redirectTo=/tags/new`}
              variant="filled"
              className="max-sm:w-full"
            >
              <Icon type="plus" />
              <span>Add tag</span>
            </LinkButton>
          </CardFooter>
        </>
      )}
    </Card>
  );
});
CardLatestTags.displayName = "CardLatestTags";
