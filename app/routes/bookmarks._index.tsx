import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useNavigation } from "@remix-run/react";
import { GeneralErrorBoundary } from "~/components/error-boundary";
import { Main } from "~/components/main";
import {
  ButtonCursorPagination,
  PaginationForm,
} from "~/components/pagination";
import { SearchForm } from "~/components/search-form";
import { SearchHelp } from "~/components/search-help";
import {
  TableBookmarks,
  columnsTableBookmarks,
} from "~/components/table-bookmarks";
import { Badge } from "~/components/ui/badge";
import { H1 } from "~/components/ui/h1";
import { Icon } from "~/components/ui/icon";
import { LinkButton } from "~/components/ui/link-button";
import { getBookmarks, getBookmarksCount } from "~/models/bookmark.server";
import { mapWithFaviconSrc } from "~/models/favicon.server";
import {
  BOOKMARK_SEARCH_KEYS,
  BOOKMARK_SEARCH_KEYS_LABEL_MAP,
  parseBookmarkSearchKey,
} from "~/utils/bookmark";
import { generateSocialMeta } from "~/utils/meta";
import { formatItemsFoundByCount, formatMetaTitle } from "~/utils/misc";
import {
  getCursorPaginationFieldEntries,
  getCursorPaginationSearchParams,
} from "~/utils/pagination.server";
import { USER_LOGIN_ROUTE } from "~/utils/user";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const searchKey = parseBookmarkSearchKey(url.searchParams.get("searchKey"));
  const searchValue = url.searchParams.get("searchValue");
  const { cursorId, limit, skip, take } = getCursorPaginationSearchParams({
    searchParams: url.searchParams,
    initialLimit: 20,
  });

  const bookmarks = await getBookmarks({
    searchKey,
    searchValue,
    skip,
    take,
    cursorId,
  });
  const count = await getBookmarksCount({ searchKey, searchValue });
  const data = await mapWithFaviconSrc(bookmarks);

  const nextCursorId =
    data.length > limit ? bookmarks.at(-1)?.id ?? null : null;
  const fields = getCursorPaginationFieldEntries({
    searchParams: url.searchParams,
    cursor: nextCursorId,
    limit,
  });
  const hasData = data.length > 0;
  const hasPagination = Boolean(nextCursorId);

  return json({
    count,
    data,
    fields,
    hasData,
    hasPagination,
    searchKey,
    searchValue,
  });
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const title = formatMetaTitle("Bookmarks");

  const description =
    data?.searchKey && data?.searchValue
      ? `${formatItemsFoundByCount({
          count: data?.count ?? 0,
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
  const navigation = useNavigation();
  const isPending = navigation.state !== "idle";

  return (
    <Main>
      <div className="flex items-center gap-2">
        <H1>
          <Icon type="bookmarks" />
          Bookmarks <Badge aria-hidden>{loaderData.count}</Badge>
        </H1>
        <LinkButton
          to={`${USER_LOGIN_ROUTE}?redirectTo=/bookmarks/status`}
          size="md-icon"
        >
          <Icon type="shield-check" />
          <span className="sr-only">Bookmarks status</span>
        </LinkButton>
        <LinkButton
          to={`${USER_LOGIN_ROUTE}?redirectTo=/bookmarks/import`}
          size="md-icon"
        >
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
        count={loaderData.count}
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

      {loaderData.hasData ? (
        <TableBookmarks
          columns={columnsTableBookmarks}
          data={loaderData.data}
        />
      ) : null}

      {loaderData.hasPagination ? (
        <PaginationForm>
          <fieldset disabled={isPending}>
            {loaderData.fields.map(([name, value]) => (
              <input key={name} type="hidden" name={name} value={value} />
            ))}

            <ButtonCursorPagination className="w-full" />
          </fieldset>
        </PaginationForm>
      ) : null}
    </Main>
  );
}

export function ErrorBoundary() {
  return <GeneralErrorBoundary />;
}
