import type { V2_MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getLatestBookmarks } from "~/models/bookmark.server";
import { getLatestTags } from "~/models/tag.server";
import { APP_DESCRIPTION, APP_DESCRIPTION_SHORT, APP_NAME } from "~/utils/misc";
// import { useOptionalUser } from "~/utils/user";

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
  // const optionalUser = useOptionalUser();

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
                    <div>{bookmark.title}</div>
                    <div>{bookmark.url}</div>
                  </Link>
                </li>
              ))}
            </ul>
            <div>
              <Link to="/bookmarks">View all&hellip;</Link>
            </div>
          </>
        ) : (
          <p>
            None found. <Link to="/bookmarks/new">+ Add Bookmark</Link>
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
                  <Link to={`/tags/${tag.id}`}>{tag.name}</Link>
                </li>
              ))}
            </ul>
            <div>
              <Link to="/tags">View all&hellip;</Link>
            </div>
          </>
        ) : (
          <p>
            None found. <Link to="/tags/new">+ Add Tag</Link>
          </p>
        )}
      </div>
    </main>
  );
}
