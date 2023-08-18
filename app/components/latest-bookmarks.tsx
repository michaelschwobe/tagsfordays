import { Link } from "@remix-run/react";
import { forwardRef } from "react";
import { Icon } from "~/components/icon";
import type { LatestBookmarksData } from "~/models/bookmark.server";
import { USER_LOGIN_ROUTE, cn } from "~/utils/misc";

export interface LatestBookmarksProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "children"> {
  /** Sets the `class` attribute. */
  className?: string;
  /** Sets the "found" content. */
  data: LatestBookmarksData;
}

export const LatestBookmarks = forwardRef<HTMLDivElement, LatestBookmarksProps>(
  ({ className, data, ...props }, forwardedRef) => {
    return (
      <div
        {...props}
        className={cn("LatestBookmarks", className)}
        ref={forwardedRef}
      >
        <h2>Latest Bookmarks</h2>
        {data.length > 0 ? (
          <>
            <ul>
              {data.map((bookmark) => (
                <li key={bookmark.id}>
                  <Link to={`/bookmarks/${bookmark.id}`}>
                    <Icon type="bookmark" />
                    <div>{bookmark.title}</div>
                    <div>{bookmark.url}</div>
                  </Link>
                </li>
              ))}
            </ul>
            <div>
              <Link to="/bookmarks">
                <Icon type="bookmarks" />
                <span>View all&hellip;</span>
              </Link>
            </div>
          </>
        ) : (
          <p>
            None found.{" "}
            <Link to={`${USER_LOGIN_ROUTE}?redirectTo=/bookmarks/new`}>
              <Icon type="plus" />
              <span>Add Bookmark</span>
            </Link>
          </p>
        )}
      </div>
    );
  },
);

LatestBookmarks.displayName = "LatestBookmarks";
