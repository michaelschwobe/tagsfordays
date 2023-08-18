import { Link } from "@remix-run/react";
import { forwardRef } from "react";
import { Icon } from "~/components/icon";
import type { LatestBookmarksData } from "~/models/bookmark.server";
import { USER_LOGIN_ROUTE, cn } from "~/utils/misc";

export interface LatestBookmarksProps
  extends Omit<React.ComponentPropsWithoutRef<"aside">, "children"> {
  /** Sets the `class` attribute. */
  className?: string;
  /** Sets the "found" content. */
  data: LatestBookmarksData;
}

export const LatestBookmarks = forwardRef<
  React.ElementRef<"aside">,
  LatestBookmarksProps
>(({ className, data, ...props }, forwardedRef) => {
  return (
    <aside
      {...props}
      className={cn("grid gap-2", className)}
      ref={forwardedRef}
    >
      <h2 className="text-lg font-semibold">Latest Bookmarks</h2>

      {data.length > 0 ? (
        <ul className="flex flex-col gap-1">
          {data.map((bookmark) => (
            <li key={bookmark.id}>
              <Link
                className="inline-flex items-baseline gap-2 hover:underline"
                to={`/bookmarks/${bookmark.id}`}
              >
                <Icon className="self-center" type="bookmark" />
                <span className="grow">
                  <span className="block truncate">{bookmark.title}</span>
                  <span className="block truncate text-xs">{bookmark.url}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>
          None found.{" "}
          <Link
            className="inline-flex items-baseline gap-[0.25em]"
            to={`${USER_LOGIN_ROUTE}?redirectTo=/bookmarks/new`}
          >
            <Icon className="self-center" type="plus" />
            <span>Add Bookmark</span>
          </Link>
        </p>
      )}

      <div>
        <Link className="underline hover:underline-offset-2" to="/bookmarks">
          View all&hellip;
        </Link>
      </div>
    </aside>
  );
});

LatestBookmarks.displayName = "LatestBookmarks";
