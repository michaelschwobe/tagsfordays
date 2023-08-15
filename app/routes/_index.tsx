import type { V2_MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { Icon } from "~/components/icon";
import { getLatestBookmarks } from "~/models/bookmark.server";
import { getLatestTags } from "~/models/tag.server";
import { APP_DESCRIPTION, APP_DESCRIPTION_SHORT, APP_NAME } from "~/utils/misc";

export async function loader() {
  const [latestBookmarks, latestTags] = await Promise.all([
    getLatestBookmarks(),
    getLatestTags(),
  ]);

  return json({ latestBookmarks, latestTags });
}

export const meta: V2_MetaFunction = () => {
  const title = `${APP_NAME} - ${APP_DESCRIPTION_SHORT}`;
  const description = APP_DESCRIPTION;

  return [{ title }, { name: "description", content: description }];
};

export default function HomePage() {
  const loaderData = useLoaderData<typeof loader>();

  return (
    <main>
      <h1>{APP_NAME}</h1>

      <div>
        <h2>Latest Bookmarks</h2>
        {loaderData.latestBookmarks.length > 0 ? (
          <>
            <ul>
              {loaderData.latestBookmarks.map((bookmark) => (
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
            <Link to="/bookmarks/new">
              <Icon type="plus" />
              <span>Add Bookmark</span>
            </Link>
          </p>
        )}
      </div>

      <div>
        <h2>Latest Tags</h2>
        {loaderData.latestTags.length > 0 ? (
          <>
            <ul>
              {loaderData.latestTags.map((tag) => (
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
            <Link to="/tags/new">
              <Icon type="plus" />
              <span>Add Tag</span>
            </Link>
          </p>
        )}
      </div>
    </main>
  );
}
