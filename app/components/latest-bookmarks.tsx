import { Link } from "@remix-run/react";
import { forwardRef } from "react";
import { H2 } from "~/components/ui/h2";
import { Icon } from "~/components/ui/icon";
import type { LatestBookmarksData } from "~/models/bookmark.server";
import { cn } from "~/utils/misc";
import { USER_LOGIN_ROUTE } from "~/utils/user";

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
      className={cn("flex flex-col gap-2", className)}
      ref={forwardedRef}
    >
      <H2>Latest Bookmarks</H2>

      {data.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {data.map((bookmark) => (
            <li key={bookmark.id}>
              <Link
                className="flex items-baseline gap-2 hover:underline"
                to={`/bookmarks/${bookmark.id}`}
              >
                <Icon className="translate-y-0.5" type="bookmark" />
                <span className="flex max-w-full flex-col overflow-hidden">
                  <span className="truncate">
                    {bookmark.title ?? "(Untitled)"}
                  </span>
                  <span className="truncate text-xs">{bookmark.url}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>
          None found.{" "}
          <Link
            className="flex w-full items-center gap-[0.25em] sm:max-w-fit"
            to={`${USER_LOGIN_ROUTE}?redirectTo=/bookmarks/new`}
          >
            <Icon type="plus" />
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
