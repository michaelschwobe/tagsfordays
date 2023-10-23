import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  BookmarksTable,
  bookmarksTableColumns,
} from "~/components/bookmarks-table";
import { GeneralErrorBoundary } from "~/components/error-boundary";
import { Main } from "~/components/main";
import { SearchForm } from "~/components/search-form";
import { SearchHelp } from "~/components/search-help";
import { Badge } from "~/components/ui/badge";
import { H1 } from "~/components/ui/h1";
import { Icon } from "~/components/ui/icon";
import { LinkButton } from "~/components/ui/link-button";
import { getBookmarks } from "~/models/bookmark.server";
import {
  BOOKMARK_SEARCH_KEYS,
  BOOKMARK_SEARCH_KEYS_LABEL_MAP,
  parseBookmarkSearchKey,
} from "~/utils/bookmark";
import { generateSocialMeta } from "~/utils/meta";
import { formatItemsFoundByCount, formatMetaTitle } from "~/utils/misc";
import { USER_LOGIN_ROUTE } from "~/utils/user";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const searchKey = parseBookmarkSearchKey(url.searchParams.get("searchKey"));
  const searchValue = url.searchParams.get("searchValue");

  const bookmarks = await getBookmarks({ searchKey, searchValue });
  // const bookmarksWithFavicon = await mapBookmarksWithFavicon(bookmarks);
  const bookmarksWithFavicon = bookmarks.map((b) => ({ ...b, favicon: null }));

  return json({ bookmarks: bookmarksWithFavicon, searchKey, searchValue });
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const title = formatMetaTitle("Bookmarks");

  const description =
    data?.searchKey && data?.searchValue
      ? `${formatItemsFoundByCount({
          count: data?.bookmarks.length ?? 0,
          singular: "bookmark",
          plural: "bookmarks",
        })} within '${
          BOOKMARK_SEARCH_KEYS_LABEL_MAP[data.searchKey]
        }' containing '${data.searchValue}'.`
      : `Browse and search all your bookmarks.`;

  return [
    { title },
    { name: "description", content: description },
    ...generateSocialMeta({ title, description }),
  ];
};

export default function BookmarksIndexPage() {
  const loaderData = useLoaderData<typeof loader>();

  const bookmarksCount = loaderData.bookmarks.length;

  return (
    <Main>
      <div className="mb-4 flex items-center gap-2">
        <H1>
          <Icon type="bookmarks" />
          Bookmarks <Badge aria-hidden>{bookmarksCount}</Badge>
        </H1>
        <LinkButton to={`${USER_LOGIN_ROUTE}?redirectTo=/bookmarks/import`}>
          <Icon type="upload" />
          <span className="sr-only">Import bookmarks</span>
        </LinkButton>
        <LinkButton
          to={`${USER_LOGIN_ROUTE}?redirectTo=/bookmarks/new`}
          variant="filled"
        >
          <Icon type="plus" />
          <Icon type="bookmark" />
          <span className="sr-only">Add bookmark</span>
        </LinkButton>
      </div>

      <SearchForm
        className="mb-4"
        searchKey={loaderData.searchKey}
        searchKeys={[...BOOKMARK_SEARCH_KEYS]}
        searchKeysLabelMap={BOOKMARK_SEARCH_KEYS_LABEL_MAP}
        searchValue={loaderData.searchValue}
      />

      <SearchHelp
        className="mb-4"
        count={bookmarksCount}
        singular="bookmark"
        plural="bookmarks"
      >
        <LinkButton
          to={`${USER_LOGIN_ROUTE}?redirectTo=/bookmarks/new`}
          className="max-sm:w-full"
          size="lg"
          variant="filled"
        >
          <Icon type="plus" />
          <span>Add bookmark</span>
        </LinkButton>{" "}
        <LinkButton
          to="."
          relative="path"
          reloadDocument
          className="max-sm:w-full"
          size="lg"
        >
          <Icon type="bookmarks" />
          <span>View all bookmarks</span>
        </LinkButton>
      </SearchHelp>

      {bookmarksCount > 0 ? (
        <BookmarksTable
          // TODO: remove ts-expect-error once this is fixed
          // @ts-expect-error - node module bug https://github.com/TanStack/table/issues/5135
          columns={bookmarksTableColumns}
          data={loaderData.bookmarks}
        />
      ) : null}
    </Main>
  );
}

export function ErrorBoundary() {
  return <GeneralErrorBoundary />;
}
