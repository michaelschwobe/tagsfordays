import { conform } from "@conform-to/react";
import type { ActionArgs, LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useLoaderData, useLocation } from "@remix-run/react";
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
  const intent = formData.get(conform.INTENT);

  if (intent === "favorite") {
    console.log("🟢 favorite", { id, userId });
    return null;
  }

  if (intent === "share") {
    console.log("🟢 share", { id, type: "bookmark" });
    return null;
  }

  if (intent === "delete") {
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
  const location = useLocation();

  return (
    <main>
      <h1>{loaderData.bookmark.title}</h1>
      <div>{loaderData.bookmark.url}</div>
      <p>{loaderData.bookmark.description}</p>

      <h2>
        {toTitleCase(
          formatItemsFoundByCount({
            count: loaderData.bookmark.tags.length,
            single: "related tag",
            plural: "related tags",
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
          <button type="submit" name={conform.INTENT} value="favorite">
            Favorite
          </button>
        </Form>
      ) : (
        <Link to={`${USER_LOGIN_ROUTE}?redirectTo=${location.pathname}`}>
          Favorite
        </Link>
      )}

      {optionalUser ? (
        <Form method="post">
          <button type="submit" name={conform.INTENT} value="share">
            Share
          </button>
        </Form>
      ) : (
        <Link to={`${USER_LOGIN_ROUTE}?redirectTo=${location.pathname}`}>
          Share
        </Link>
      )}

      <Link to="edit">Edit</Link>

      {optionalUser ? (
        <Form method="post">
          <button type="submit" name={conform.INTENT} value="delete">
            Delete
          </button>
        </Form>
      ) : (
        <Link to={`${USER_LOGIN_ROUTE}?redirectTo=${location.pathname}`}>
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
