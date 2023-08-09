import { conform } from "@conform-to/react";
import type { ActionArgs, V2_MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, useLoaderData, useLocation } from "@remix-run/react";
import { GeneralErrorBoundary } from "~/components/error-boundary";
import { favoriteBookmark, getBookmarks } from "~/models/bookmark.server";
import { requireUserId } from "~/utils/auth.server";
import { FavoriteBookmarkFormSchema } from "~/utils/bookmark-validation";
import {
  USER_LOGIN_ROUTE,
  formatItemsFoundByCount,
  formatMetaTitle,
  toTitleCase,
} from "~/utils/misc";
import { useOptionalUser } from "~/utils/user";

export async function loader() {
  const bookmarks = await getBookmarks();

  return json({ bookmarks });
}

export async function action({ request }: ActionArgs) {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const intent = formData.get(conform.INTENT);

  if (intent === "favorite") {
    const formFields = Object.fromEntries(formData.entries());
    const submission = FavoriteBookmarkFormSchema.safeParse(formFields);
    if (submission.success) {
      const { id, favorite = null } = submission.data;
      await favoriteBookmark({ id, favorite, userId });
    }
  }

  return null;
}

export const meta: V2_MetaFunction = () => {
  const title = formatMetaTitle("Bookmarks");
  const description = "Bookmarks"; // TODO: Add description

  return [{ title }, { name: "description", content: description }];
};

export default function BookmarksIndexPage() {
  const loaderData = useLoaderData<typeof loader>();
  const optionalUser = useOptionalUser();
  const location = useLocation();

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
              {optionalUser ? (
                <Form method="POST">
                  <input type="hidden" name={conform.INTENT} value="favorite" />
                  <input type="hidden" id="id" name="id" value={bookmark.id} />
                  <input
                    type="hidden"
                    name="favorite"
                    value={bookmark.favorite === true ? "false" : "true"}
                  />
                  <button type="submit">
                    {bookmark.favorite ? "💚" : "🤍"} Favorite
                  </button>
                </Form>
              ) : (
                <Link
                  to={`${USER_LOGIN_ROUTE}?redirectTo=${location.pathname}`}
                >
                  {bookmark.favorite ? "💚" : "🤍"} Favorite
                </Link>
              )}
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
