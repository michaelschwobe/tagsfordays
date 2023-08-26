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
import type { LatestBookmarksData } from "~/models/bookmark.server";
import { cn } from "~/utils/misc";
import { USER_LOGIN_ROUTE } from "~/utils/user";

export interface LatestBookmarksProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "children"> {
  /** Sets the `class` attribute. */
  className?: string;
  /** Sets the "found" content. */
  data: LatestBookmarksData;
}

export const LatestBookmarks = forwardRef<
  React.ElementRef<"div">,
  LatestBookmarksProps
>(({ className, data, ...props }, forwardedRef) => {
  return (
    <Card {...props} className={cn(className)} ref={forwardedRef}>
      <CardHeader>
        <H2>Latest Bookmarks</H2>
      </CardHeader>
      {data.length > 0 ? (
        <>
          <CardContent>
            <ul className="divide-y divide-slate-300 rounded-md border border-slate-300 bg-white">
              {data.map((bookmark) => (
                <li key={bookmark.id} className="flex gap-1 p-1">
                  <LinkButton
                    className="max-w-[18rem] basis-1/3 justify-start overflow-hidden"
                    to={`/bookmarks/${bookmark.id}`}
                    variant="ghost"
                  >
                    <Icon type="bookmark" />
                    <span className="truncate text-sm">
                      {bookmark.title ? (
                        <span>{bookmark.title}</span>
                      ) : (
                        <span aria-label="Untitled">--</span>
                      )}
                    </span>
                  </LinkButton>

                  <LinkButton
                    className="grow justify-between overflow-hidden font-normal"
                    to={bookmark.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="ghost"
                  >
                    <span className="truncate text-xs font-normal">
                      {bookmark.url}
                    </span>
                    <Icon type="external-link" />
                  </LinkButton>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter className="mt-auto">
            <LinkButton
              to="/bookmarks"
              className="max-sm:w-full"
              variant="filled"
            >
              <Icon type="bookmarks" />
              <span>View all bookmarks</span>
            </LinkButton>
          </CardFooter>
        </>
      ) : (
        <>
          <CardContent>
            <p>None found.</p>
          </CardContent>
          <CardFooter className="mt-auto">
            <LinkButton to={`${USER_LOGIN_ROUTE}?redirectTo=/bookmarks/new`}>
              <Icon type="plus" />
              <span>Add bookmark</span>
            </LinkButton>
          </CardFooter>
        </>
      )}
    </Card>
  );
});

LatestBookmarks.displayName = "LatestBookmarks";
