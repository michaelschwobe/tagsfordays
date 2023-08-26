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
import type { LatestTagsData } from "~/models/tag.server";
import { cn } from "~/utils/misc";
import { USER_LOGIN_ROUTE } from "~/utils/user";

export interface LatestTagsProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "children"> {
  /** Sets the `class` attribute. */
  className?: string;
  /** Sets the "found" content. */
  data: LatestTagsData;
}

export const LatestTags = forwardRef<React.ElementRef<"div">, LatestTagsProps>(
  ({ className, data, ...props }, forwardedRef) => {
    return (
      <Card {...props} className={cn(className)} ref={forwardedRef}>
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
                      className="max-w-[11rem]"
                      to={`/tags/${tag.id}`}
                      size="sm"
                    >
                      <Icon type="tag" />
                      <span className="truncate">{tag.name}</span>
                    </LinkButton>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="mt-auto">
              <LinkButton to="/tags" className="max-sm:w-full" variant="filled">
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
              <LinkButton to={`${USER_LOGIN_ROUTE}?redirectTo=/tags/new`}>
                <Icon type="plus" />
                <span>Add tag</span>
              </LinkButton>
            </CardFooter>
          </>
        )}
      </Card>
    );
  },
);

LatestTags.displayName = "LatestTags";
