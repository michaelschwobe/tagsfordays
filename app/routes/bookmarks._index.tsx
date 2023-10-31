import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  BookmarksTable,
  bookmarksTableColumns,
} from "~/components/bookmarks-table";
import { GeneralErrorBoundary } from "~/components/error-boundary";
import { Main } from "~/components/main";
import { Pagination, paginateSearchParams } from "~/components/pagination";
import { SearchForm } from "~/components/search-form";
import { SearchHelp } from "~/components/search-help";
import { Badge } from "~/components/ui/badge";
import { H1 } from "~/components/ui/h1";
import { Icon } from "~/components/ui/icon";
import { LinkButton } from "~/components/ui/link-button";
import { getBookmarks } from "~/models/bookmark.server";
import { mapWithFaviconSrc } from "~/models/favicon.server";
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

  const defaultPerPage = 20;
  const { params, skip, take } = paginateSearchParams({
    searchParams: url.searchParams,
    defaultPerPage,
  });

  const bookmarksResult = await getBookmarks({ searchKey, searchValue });
  const bookmarksLength = bookmarksResult.length;
  const bookmarksPaginated = bookmarksResult.slice(skip, skip + take);
  const bookmarks = await mapWithFaviconSrc(bookmarksPaginated);

  const hasBookmarks = bookmarksLength > 0;
  const hasPagination = bookmarksLength > defaultPerPage;

  return json({
    bookmarks,
    bookmarksLength,
    hasBookmarks,
    hasPagination,
    params,
    searchKey,
    searchValue,
    skip,
    take,
  });
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const title = formatMetaTitle("Bookmarks");

  const description =
    data?.searchKey && data?.searchValue
      ? `${formatItemsFoundByCount({
          count: data?.bookmarksLength ?? 0,
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

  return (
    <Main>
      <div className="flex items-center gap-2">
        <H1>
          <Icon type="bookmarks" />
          Bookmarks <Badge aria-hidden>{loaderData.bookmarksLength}</Badge>
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
        searchKey={loaderData.searchKey}
        searchKeys={[...BOOKMARK_SEARCH_KEYS]}
        searchKeysLabelMap={BOOKMARK_SEARCH_KEYS_LABEL_MAP}
        searchValue={loaderData.searchValue}
      />

      <SearchHelp
        count={loaderData.bookmarksLength}
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

      {loaderData.hasBookmarks ? (
        <BookmarksTable
          // TODO: remove comment once this is fixed.
          // @ts-expect-error - node module bug https://github.com/TanStack/table/issues/5135
          columns={bookmarksTableColumns}
          data={loaderData.bookmarks}
        />
      ) : null}

      {loaderData.hasPagination ? (
        <Pagination
          params={loaderData.params}
          skip={loaderData.skip}
          take={loaderData.take}
          total={loaderData.bookmarksLength}
        />
      ) : null}
    </Main>
  );
}

export function ErrorBoundary() {
  return <GeneralErrorBoundary />;
}
