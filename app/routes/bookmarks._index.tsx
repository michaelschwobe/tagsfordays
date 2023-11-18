import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useNavigation } from "@remix-run/react";
import { ButtonExport } from "~/components/button-export";
import { ButtonFirst } from "~/components/button-first";
import { ButtonLast } from "~/components/button-last";
import { ButtonNext } from "~/components/button-next";
import { ButtonPage } from "~/components/button-page";
import { ButtonPrev } from "~/components/button-prev";
import { GeneralErrorBoundary } from "~/components/error-boundary";
import { FormExport } from "~/components/form-export";
import { FormPaginate } from "~/components/form-paginate";
import { Main } from "~/components/main";
import { SearchForm } from "~/components/search-form";
import { SearchHelp } from "~/components/search-help";
import { columnsBookmarks } from "~/components/table-columns";
import { TableSelectable } from "~/components/table-selectable";
import { Badge } from "~/components/ui/badge";
import { H1 } from "~/components/ui/h1";
import { Icon } from "~/components/ui/icon";
import { LinkButton } from "~/components/ui/link-button";
import { getBookmarks } from "~/models/bookmark.server";
import {
  BOOKMARK_EXPORT_FILE_EXTENSIONS,
  BOOKMARK_SEARCH_KEYS,
  BOOKMARK_SEARCH_KEYS_LABEL_MAP,
} from "~/utils/bookmark";
import { parseBookmarkSearchParams } from "~/utils/bookmark-validation";
import { getFavicons } from "~/utils/favicon.server";
import { generateSocialMeta } from "~/utils/meta";
import { formatItemsFoundByCount, formatMetaTitle } from "~/utils/misc";
import {
  toPaginationSearchParams,
  toPaginationValues,
} from "~/utils/pagination";
import { USER_LOGIN_ROUTE } from "~/utils/user";

export async function loader({ request }: LoaderFunctionArgs) {
  const { searchParams } = new URL(request.url);
  const { searchKey, searchValue, skip, take } =
    parseBookmarkSearchParams(searchParams);

  const bookmarks = await getBookmarks({ searchKey, searchValue });
  const count = bookmarks.length;
  const data = await getFavicons(bookmarks.slice(skip, skip + take));

  const paginationSearchParams = toPaginationSearchParams({
    searchParams,
    take,
  });
  const paginationValues = toPaginationValues({
    pagesMax: 5,
    skip,
    take,
    total: count,
  });
  const hasData = data.length > 0;
  const hasPagination = count > take;

  return json({
    count,
    data,
    hasData,
    hasPagination,
    paginationSearchParams,
    paginationValues,
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
        <TableSelectable
          className="[&_[data-header-id=title]]:w-1/5 [&_[data-header-id=url]]:w-full"
          columns={columnsBookmarks}
          data={loaderData.data}
        >
          {({ idsSelected, idsNotSelected }) => (
            <>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                {BOOKMARK_EXPORT_FILE_EXTENSIONS.map((ext) => (
                  <FormExport
                    key={ext}
                    actionRoute="/bookmarks"
                    fileExtension={ext}
                    idsSelected={
                      idsSelected.length > 0 ? idsSelected : idsNotSelected
                    }
                    className="w-full"
                  >
                    <ButtonExport
                      type="submit"
                      fileExtension={ext}
                      className="w-full"
                      disabled={isPending}
                    />
                  </FormExport>
                ))}
              </div>
              {loaderData.hasPagination ? (
                <FormPaginate className="grid grid-cols-9 gap-2 max-sm:-order-1">
                  {loaderData.paginationSearchParams.map(([name, value]) => (
                    <input key={name} type="hidden" name={name} value={value} />
                  ))}
                  <ButtonFirst
                    name="skip"
                    value={0}
                    disabled={
                      isPending || !loaderData.paginationValues.hasPrevPage
                    }
                    size="sm-icon"
                  />
                  <ButtonPrev
                    name="skip"
                    value={loaderData.paginationValues.prevPageValue}
                    disabled={
                      isPending || !loaderData.paginationValues.hasPrevPage
                    }
                    size="sm-icon"
                  />
                  {loaderData.paginationValues.skipPages.map((el) => (
                    <ButtonPage
                      key={el.number}
                      name="skip"
                      value={el.value}
                      number={el.number}
                      isCurrPage={el.isCurrPage}
                      disabled={isPending || !el.isSkipPage}
                      size="sm-icon"
                      variant={el.isCurrPage ? "ghost" : undefined}
                    />
                  ))}
                  <ButtonNext
                    name="skip"
                    value={loaderData.paginationValues.nextPageValue}
                    disabled={
                      isPending || !loaderData.paginationValues.hasNextPage
                    }
                    size="sm-icon"
                  />
                  <ButtonLast
                    name="skip"
                    value={loaderData.paginationValues.lastPageValue}
                    disabled={
                      isPending || !loaderData.paginationValues.hasNextPage
                    }
                    size="sm-icon"
                  />
                </FormPaginate>
              ) : null}
            </>
          )}
        </TableSelectable>
      ) : null}
    </Main>
  );
}

export function ErrorBoundary() {
  return <GeneralErrorBoundary />;
}
