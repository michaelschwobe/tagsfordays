import type { V2_MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { GeneralErrorBoundary } from "~/components/error-boundary";
import { getBookmarkListItems } from "~/models/bookmark.server";
import {
  formatItemsFoundByCount,
  formatMetaTitle,
  toTitleCase,
} from "~/utils/misc";

export async function loader() {
  const bookmarkListItems = await getBookmarkListItems();
  return json({ bookmarkListItems });
}

export const meta: V2_MetaFunction = () => {
  const title = formatMetaTitle("Bookmarks");
  return [{ title }];
};

export default function BookmarksIndexPage() {
  const loaderData = useLoaderData<typeof loader>();

  return (
    <main>
      <h1>
        {toTitleCase(
          formatItemsFoundByCount({
            count: loaderData.bookmarkListItems.length,
            single: "bookmark",
            plural: "bookmarks",
          }),
        )}
      </h1>

      <div>
        <Link to="new">+ Add Bookmark</Link>
      </div>

      {loaderData.bookmarkListItems.length > 0 ? (
        <ul>
          {loaderData.bookmarkListItems.map((bookmark) => (
            <li key={bookmark.id}>
              <Link to={bookmark.id}>
                <div>{bookmark.title}</div>
                <div>{bookmark.url}</div>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </main>
  );
}

export function ErrorBoundary() {
  return <GeneralErrorBoundary />;
}
