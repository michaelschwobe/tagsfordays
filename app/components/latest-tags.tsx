import { Link } from "@remix-run/react";
import { forwardRef } from "react";
import { Icon } from "~/components/ui/icon";
import type { LatestTagsData } from "~/models/tag.server";
import { cn } from "~/utils/misc";
import { USER_LOGIN_ROUTE } from "~/utils/user";

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
      className={cn("flex flex-col gap-2", className)}
      ref={forwardedRef}
    >
      <h2 className="text-lg font-semibold">Latest Tags</h2>

      {data.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {data.map((tag) => (
            <li key={tag.id}>
              <Link
                className="flex items-baseline gap-2 hover:underline"
                to={`/tags/${tag.id}`}
              >
                <Icon className="translate-y-0.5" type="tag" />
                <span className="truncate">{tag.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>
          None found.{" "}
          <Link
            className="flex w-full items-baseline gap-[0.25em] sm:max-w-fit"
            to={`${USER_LOGIN_ROUTE}?redirectTo=/tags/new`}
          >
            <Icon type="plus" />
            <span>Add Tag</span>
          </Link>
        </p>
      )}

      <div>
        <Link className="underline hover:underline-offset-2" to="/tags">
          View all&hellip;
        </Link>
      </div>
    </aside>
  );
});

LatestTags.displayName = "LatestTags";
