import { Link } from "@remix-run/react";
import { forwardRef } from "react";
import { Icon } from "~/components/icon";
import type { LatestTagsData } from "~/models/tag.server";
import { USER_LOGIN_ROUTE, cn } from "~/utils/misc";

export interface LatestTagsProps
  extends Omit<React.ComponentPropsWithoutRef<"aside">, "children"> {
  /** Sets the `class` attribute. */
  className?: string;
  /** Sets the "found" content. */
  data: LatestTagsData;
}

export const LatestTags = forwardRef<
  React.ElementRef<"aside">,
  LatestTagsProps
>(({ className, data, ...props }, forwardedRef) => {
  return (
    <aside
      {...props}
      className={cn("LatestTags", className)}
      ref={forwardedRef}
    >
      <h2>Latest Tags</h2>
      {data.length > 0 ? (
        <>
          <ul>
            {data.map((tag) => (
              <li key={tag.id}>
                <Link to={`/tags/${tag.id}`}>
                  <Icon type="tag" />
                  <span>{tag.name}</span>
                </Link>
              </li>
            ))}
          </ul>
          <div>
            <Link to="/tags">
              <Icon type="tags" />
              <span>View all&hellip;</span>
            </Link>
          </div>
        </>
      ) : (
        <p>
          None found.{" "}
          <Link to={`${USER_LOGIN_ROUTE}?redirectTo=/tags/new`}>
            <Icon type="plus" />
            <span>Add Tag</span>
          </Link>
        </p>
      )}
    </aside>
  );
});

LatestTags.displayName = "LatestTags";
