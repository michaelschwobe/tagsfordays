import { conform } from "@conform-to/react";
import type { ActionArgs, LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Form,
  Link,
  useLoaderData,
  useLocation,
  useNavigation,
} from "@remix-run/react";
import { GeneralErrorBoundary } from "~/components/error-boundary";
import { Icon } from "~/components/icon";
import { SearchForm } from "~/components/search-form";
import { SearchHelp } from "~/components/search-help";
import { favoriteBookmark, getBookmarks } from "~/models/bookmark.server";
import { requireUserId } from "~/utils/auth.server";
import {
  BOOKMARK_SEARCH_KEYS,
  BOOKMARK_SEARCH_KEYS_LABEL_MAP,
  getBookmarkSearchKey,
} from "~/utils/bookmark";
import { FavoriteBookmarkFormSchema } from "~/utils/bookmark-validation";
import {
  USER_LOGIN_ROUTE,
  formatItemsFoundByCount,
  formatMetaTitle,
  toTitleCase,
} from "~/utils/misc";
import { useOptionalUser } from "~/utils/user";

export async function loader({ request }: LoaderArgs) {
  const url = new URL(request.url);
  const searchKey = getBookmarkSearchKey(url.searchParams.get("searchKey"));
  const searchValue = url.searchParams.get("searchValue");

  const bookmarks = await getBookmarks({ searchKey, searchValue });

  return json({ bookmarks, searchKey, searchValue });
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
  const location = useLocation();
  const navigation = useNavigation();
  const optionalUser = useOptionalUser();

  const disabled = ["submitting", "loading"].includes(navigation.state);
  const hasBookmarks = loaderData.bookmarks.length > 0;
  const hasSearchValue = (loaderData.searchValue ?? "").length > 0;

  return (
    <main>
      <SearchForm
        searchKey={loaderData.searchKey}
        searchKeys={[...BOOKMARK_SEARCH_KEYS]}
        searchKeysLabelMap={BOOKMARK_SEARCH_KEYS_LABEL_MAP}
        searchValue={loaderData.searchValue}
      />

      <h1>
        {hasSearchValue
          ? toTitleCase(
              formatItemsFoundByCount({
                count: loaderData.bookmarks.length,
                single: "bookmark",
                plural: "bookmarks",
              }),
            )
          : "Bookmarks"}
      </h1>

      {hasSearchValue && !hasBookmarks ? (
        <SearchHelp
          items={[
            <Link
              key="new"
              to={`${USER_LOGIN_ROUTE}?redirectTo=/bookmarks/new`}
            >
              <Icon type="plus" />
              <span>Add Bookmark</span>
            </Link>,
            <Link key="all" to="." reloadDocument>
              <Icon type="bookmarks" />
              <span>View all bookmarks</span>
            </Link>,
          ]}
        />
      ) : (
        <div>
          <Link to={`${USER_LOGIN_ROUTE}?redirectTo=/bookmarks/new`}>
            <Icon type="plus" />
            <span>Add Bookmark</span>
          </Link>
        </div>
      )}

      {hasBookmarks ? (
        <ul>
          {loaderData.bookmarks.map((bookmark) => (
            <li key={bookmark.id}>
              <Link to={bookmark.id}>
                <Icon type="bookmark" />
                <div>{bookmark.title}</div>
                <div>{bookmark.url}</div>
              </Link>
              {optionalUser ? (
                <Form method="POST">
                  <fieldset disabled={disabled}>
                    <input
                      type="hidden"
                      name={conform.INTENT}
                      value="favorite"
                    />
                    <input
                      type="hidden"
                      id="id"
                      name="id"
                      value={bookmark.id}
                    />
                    <input
                      type="hidden"
                      name="favorite"
                      value={bookmark.favorite === true ? "false" : "true"}
                    />
                    <button type="submit">
                      {bookmark.favorite ? (
                        <Icon type="heart" className="text-red-500" />
                      ) : (
                        <Icon type="heart" />
                      )}{" "}
                      Favorite
                    </button>
                  </fieldset>
                </Form>
              ) : (
                <Link
                  to={`${USER_LOGIN_ROUTE}?redirectTo=${location.pathname}`}
                >
                  {bookmark.favorite ? (
                    <Icon type="heart" className="text-red-500" />
                  ) : (
                    <Icon type="heart" />
                  )}{" "}
                  Favorite
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
