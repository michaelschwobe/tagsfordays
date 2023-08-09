import type { V2_MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { GeneralErrorBoundary } from "~/components/error-boundary";
import { getBookmarks } from "~/models/bookmark.server";
import {
  formatItemsFoundByCount,
  formatMetaTitle,
  toTitleCase,
} from "~/utils/misc";

export async function loader() {
  const bookmarks = await getBookmarks();

  return json({ bookmarks });
}

export const meta: V2_MetaFunction = () => {
  const title = formatMetaTitle("Bookmarks");
  const description = "Bookmarks"; // TODO: Add description

  return [{ title }, { name: "description", content: description }];
};

export default function BookmarksIndexPage() {
  const loaderData = useLoaderData<typeof loader>();

  return (
    <main>
      <h1>
        {toTitleCase(
          formatItemsFoundByCount({
            count: loaderData.bookmarks.length,
            single: "bookmark",
            plural: "bookmarks",
          }),
        )}
      </h1>

      <div>
        <Link to="new">+ Add Bookmark</Link>
      </div>

      {loaderData.bookmarks.length > 0 ? (
        <ul>
          {loaderData.bookmarks.map((bookmark) => (
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
