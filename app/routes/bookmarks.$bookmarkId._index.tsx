import { conform } from "@conform-to/react";
import type { ActionArgs, LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  Link,
  useLoaderData,
  useLocation,
  useNavigation,
} from "@remix-run/react";
import invariant from "tiny-invariant";
import { GeneralErrorBoundary } from "~/components/error-boundary";
import { Icon } from "~/components/icon";
import {
  deleteBookmark,
  favoriteBookmark,
  getBookmark,
} from "~/models/bookmark.server";
import { requireUserId } from "~/utils/auth.server";
import { FavoriteBookmarkFormSchema } from "~/utils/bookmark-validation";
import {
  USER_LOGIN_ROUTE,
  asyncShare,
  formatItemsFoundByCount,
  formatMetaTitle,
  toTitleCase,
  useDoubleCheck,
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
    const formFields = Object.fromEntries(formData.entries());
    const submission = FavoriteBookmarkFormSchema.safeParse(formFields);
    if (submission.success) {
      const { id, favorite = null } = submission.data;
      await favoriteBookmark({ id, favorite, userId });
    }
  }

  if (intent === "delete") {
    await deleteBookmark({ id, userId });
    return redirect("/bookmarks");
  }

  return null;
}

export const meta: V2_MetaFunction<typeof loader> = ({ data }) => {
  const title = data?.bookmark.title
    ? formatMetaTitle(data.bookmark.title)
    : "404: Bookmark Not Found";
  const description = data?.bookmark.description
    ? data.bookmark.description
    : "Bookmark"; // TODO: Add description

  return [{ title }, { name: "description", content: description }];
};

export default function BookmarkDetailPage() {
  const loaderData = useLoaderData<typeof loader>();
  const location = useLocation();
  const navigation = useNavigation();
  const optionalUser = useOptionalUser();

  const doubleCheck = useDoubleCheck();

  return (
    <main>
      <h1>{loaderData.bookmark.title}</h1>
      <div>
        <span>{loaderData.bookmark.url}</span> <Icon type="external-link" />
      </div>
      <p>{loaderData.bookmark.description}</p>

      <h2>
        <Icon type="tags" />
        <span>
          {toTitleCase(
            formatItemsFoundByCount({
              count: loaderData.bookmark.tags.length,
              single: "related tag",
              plural: "related tags",
            }),
          )}
        </span>
      </h2>
      {loaderData.bookmark.tags.length > 0 ? (
        <ul>
          {loaderData.bookmark.tags.map(({ tag }) => (
            <li key={tag.id}>
              <Link to={`/tags/${tag.id}`}>
                <Icon type="tag" />
                <span>{tag.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div>
          <Link to="/tags">
            <Icon type="tags" />
            <span>View all Tags</span>
          </Link>
        </div>
      )}

      {optionalUser ? (
        <Form method="POST">
          <input type="hidden" name={conform.INTENT} value="favorite" />
          <input
            type="hidden"
            id="id"
            name="id"
            value={loaderData.bookmark.id}
          />
          <input
            type="hidden"
            name="favorite"
            value={loaderData.bookmark.favorite === true ? "false" : "true"}
          />
          <button type="submit">
            {loaderData.bookmark.favorite ? (
              <Icon type="heart" className="text-red-500" />
            ) : (
              <Icon type="heart" />
            )}{" "}
            <span>Favorite</span>
          </button>
        </Form>
      ) : (
        <Link to={`${USER_LOGIN_ROUTE}?redirectTo=${location.pathname}`}>
          {loaderData.bookmark.favorite ? (
            <Icon type="heart" className="text-red-500" />
          ) : (
            <Icon type="heart" />
          )}{" "}
          <span>Favorite</span>
        </Link>
      )}

      <button type="button" onClick={async () => await asyncShare()}>
        <Icon type="share" />
        <span>Share</span>
      </button>

      <Link to={`${USER_LOGIN_ROUTE}?redirectTo=${location.pathname}/edit`}>
        <Icon type="pencil" />
        <span>Edit</span>
      </Link>

      {optionalUser ? (
        <Form method="POST">
          <input type="hidden" name={conform.INTENT} value="delete" />
          <button {...doubleCheck.getButtonProps({ type: "submit" })}>
            {navigation.state === "idle" ? (
              doubleCheck.isPending ? (
                <>
                  <Icon type="alert-triangle" />
                  <span>Confirm Delete</span>
                </>
              ) : (
                <>
                  <Icon type="trash-2" />
                  <span>Delete</span>
                </>
              )
            ) : (
              <>
                <Icon type="loader" />
                <span>Deleting...</span>
              </>
            )}
          </button>
        </Form>
      ) : (
        <Link to={`${USER_LOGIN_ROUTE}?redirectTo=${location.pathname}`}>
          <Icon type="trash-2" />
          <span>Delete</span>
        </Link>
      )}

      <Link to="/bookmarks">
        <Icon type="bookmarks" />
        <span>View all Bookmarks</span>
      </Link>
    </main>
  );
}

export function ErrorBoundary() {
  return (
    <GeneralErrorBoundary
      statusHandlers={{
        404: () => (
          <main>
            <h1>
              <Icon type="alert-triangle" />
              <span>Error</span>
            </h1>
            <p>
              Bookmark not found.{" "}
              <Link to="/bookmarks">
                <Icon type="bookmarks" />
                <span>View all Bookmarks</span>
              </Link>
            </p>
          </main>
        ),
      }}
    />
  );
}
