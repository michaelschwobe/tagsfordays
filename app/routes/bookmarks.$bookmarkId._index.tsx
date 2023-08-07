import type { ActionArgs, LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { GeneralErrorBoundary } from "~/components/error-boundary";
import { deleteBookmark, getBookmark } from "~/models/bookmark.server";
import { requireUserId } from "~/utils/auth.server";
import {
  USER_LOGIN_ROUTE,
  formatItemsFoundByCount,
  formatMetaTitle,
  toTitleCase,
} from "~/utils/misc";
import { useOptionalUser } from "~/utils/user";

export async function loader({ params }: LoaderArgs) {
  invariant(params["bookmarkId"], "bookmarkId not found");
  const { bookmarkId: id } = params;

  const bookmark = await getBookmark({ id });

  if (!bookmark) {
    throw new Response("Not Found", { status: 404 });
  }

  return json({ bookmark });
}

export async function action({ params, request }: ActionArgs) {
  const userId = await requireUserId(request);

  invariant(params["bookmarkId"], "bookmarkId not found");
  const { bookmarkId: id } = params;

  const formData = await request.formData();
  const action = formData.get("_action");

  if (action === "FAVORITE") {
    console.log("🟢 FAVORITE", id);
    return null;
  }

  if (action === "SHARE") {
    console.log("🟢 SHARE", id);
    return null;
  }

  if (action === "DELETE") {
    await deleteBookmark({ id, userId });
    return redirect("/bookmarks");
  }

  return null;
}

export const meta: V2_MetaFunction<typeof loader> = ({ data }) => {
  const title = formatMetaTitle(
    data?.bookmark.title
      ? `Bookmark: ${data.bookmark.title}`
      : "404: Bookmark Not Found",
  );
  return [{ title }];
};

export default function BookmarkDetailPage() {
  const loaderData = useLoaderData<typeof loader>();
  const optionalUser = useOptionalUser();

  return (
    <main>
      <h1>{loaderData.bookmark.title}</h1>
      <div>{loaderData.bookmark.url}</div>
      <p>{loaderData.bookmark.description}</p>

      <h2>
        {toTitleCase(
          formatItemsFoundByCount({
            count: loaderData.bookmark.tags.length,
            single: "tag",
            plural: "tags",
          }),
        )}
      </h2>
      {loaderData.bookmark.tags.length > 0 ? (
        <ul>
          {loaderData.bookmark.tags.map(({ tag }) => (
            <li key={tag.id}>
              <Link to={`/tags/${tag.id}`}>{tag.name}</Link>
            </li>
          ))}
        </ul>
      ) : (
        <div>
          <Link to="/tags">View all Tags</Link>
        </div>
      )}

      {optionalUser ? (
        <Form method="post">
          <button type="submit" name="_action" value="FAVORITE">
            Favorite
          </button>
        </Form>
      ) : (
        <Link
          to={`${USER_LOGIN_ROUTE}?redirectTo=/bookmarks/${loaderData.bookmark.id}`}
        >
          Favorite
        </Link>
      )}

      {optionalUser ? (
        <Form method="post">
          <button type="submit" name="_action" value="SHARE">
            Share
          </button>
        </Form>
      ) : (
        <Link
          to={`${USER_LOGIN_ROUTE}?redirectTo=/bookmarks/${loaderData.bookmark.id}`}
        >
          Share
        </Link>
      )}

      <Link to="edit">Edit</Link>

      {optionalUser ? (
        <Form method="post">
          <button type="submit" name="_action" value="DELETE">
            Delete
          </button>
        </Form>
      ) : (
        <Link
          to={`${USER_LOGIN_ROUTE}?redirectTo=/bookmarks/${loaderData.bookmark.id}`}
        >
          Delete
        </Link>
      )}

      <Link to="/bookmarks">View all Bookmarks</Link>
    </main>
  );
}

export function ErrorBoundary() {
  return (
    <GeneralErrorBoundary
      statusHandlers={{
        404: () => (
          <main>
            <h1>Error</h1>
            <p>
              Bookmark not found.{" "}
              <Link to="/bookmarks">View all Bookmarks</Link>
            </p>
          </main>
        ),
      }}
    />
  );
}
