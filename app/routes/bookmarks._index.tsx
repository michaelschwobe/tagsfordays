import { conform, useForm } from "@conform-to/react";
import { parse } from "@conform-to/zod";
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
import { SearchHelp } from "~/components/search-help";
import { favoriteBookmark, getBookmarks } from "~/models/bookmark.server";
import { requireUserId } from "~/utils/auth.server";
import { SEARCH_KEYS, getSearchKey } from "~/utils/bookmark";
import {
  FavoriteBookmarkFormSchema,
  SearchBookmarkFormSchema,
} from "~/utils/bookmark-validation";
import {
  USER_LOGIN_ROUTE,
  formatItemsFoundByCount,
  formatMetaTitle,
  toTitleCase,
} from "~/utils/misc";
import { useOptionalUser } from "~/utils/user";

export async function loader({ request }: LoaderArgs) {
  const url = new URL(request.url);
  const searchKey = getSearchKey(url.searchParams.get("searchKey"));
  const searchValue = url.searchParams.get("searchValue");

  const bookmarks = await getBookmarks({ searchKey, searchValue });

  return json({ bookmarks, searchKey, searchValue });
}

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get(conform.INTENT);

  if (intent === "favorite") {
    const userId = await requireUserId(request);
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

  const [form, fieldset] = useForm({
    id: "search-bookmark",
    defaultValue: {
      searchValue: loaderData.searchValue ?? undefined,
      searchKey: loaderData.searchKey,
    },
    //  lastSubmission: actionData!, // Lie! exactOptionalPropertyTypes mismatch
    onValidate({ formData }) {
      return parse(formData, { schema: SearchBookmarkFormSchema });
    },
  });

  const disabled = ["submitting", "loading"].includes(navigation.state);
  const hasBookmarks = loaderData.bookmarks.length > 0;
  const hasSearchValue = (loaderData.searchValue ?? "").length > 0;

  return (
    <main>
      <h1>Bookmarks</h1>

      <Form method="GET" {...form.props}>
        <fieldset disabled={disabled}>
          <div>
            <label htmlFor={fieldset.searchValue.id}>Search for</label>{" "}
            <input
              {...conform.input(fieldset.searchValue, { type: "text" })}
              autoComplete="false"
            />{" "}
            {fieldset.searchValue.error ? (
              <div id={fieldset.searchValue.errorId}>
                {fieldset.searchValue.error}
              </div>
            ) : null}
          </div>
          <fieldset>
            <legend>Search by</legend>{" "}
            <div>
              {conform
                .collection(fieldset.searchKey, {
                  type: "radio",
                  options: SEARCH_KEYS.slice(),
                })
                .map((props, index) => (
                  <label htmlFor={props.id} key={index}>
                    <input {...props} />
                    <span>{props.value}</span>
                  </label>
                ))}
            </div>
            {fieldset.searchKey.error ? (
              <div id={fieldset.searchKey.errorId}>
                {fieldset.searchKey.error}
              </div>
            ) : null}
          </fieldset>
          <div>
            <button type="submit">
              <Icon type="search" />
              <span className="sr-only">Submit</span>
            </button>{" "}
            <Link to="." reloadDocument>
              <Icon type="x" />
              <span className="sr-only">Clear Filters</span>
            </Link>
          </div>
        </fieldset>
      </Form>

      <h2>
        {toTitleCase(
          formatItemsFoundByCount({
            count: loaderData.bookmarks.length,
            single: "bookmark",
            plural: "bookmarks",
          }),
        )}
      </h2>

      {hasSearchValue && !hasBookmarks ? (
        <SearchHelp
          items={[
            <Link key="new" to="new">
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
          <Link to="new">
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
