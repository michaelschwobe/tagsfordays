import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useNavigation } from "@remix-run/react";
import { ButtonFirst } from "~/components/button-first";
import { ButtonLast } from "~/components/button-last";
import { ButtonNext } from "~/components/button-next";
import { ButtonPage } from "~/components/button-page";
import { ButtonPrev } from "~/components/button-prev";
import { GeneralErrorBoundary } from "~/components/error-boundary";
import { FormPaginate } from "~/components/form-paginate";
import { Main } from "~/components/main";
import { SearchForm } from "~/components/search-form";
import { SearchHelp } from "~/components/search-help";
import { columnsBooks } from "~/components/table-columns-books";
import { TableSelectable } from "~/components/table-selectable";
import { Badge } from "~/components/ui/badge";
import { H1 } from "~/components/ui/h1";
import { Icon } from "~/components/ui/icon";
import { LinkButton } from "~/components/ui/link-button";
import { getBooks } from "~/models/book.server";
import { BOOK_SEARCH_KEYS, BOOK_SEARCH_KEYS_LABEL_MAP } from "~/utils/book";
import { generateSocialMeta } from "~/utils/meta";
import { formatItemsFoundByCount, formatMetaTitle } from "~/utils/misc";
import {
  toPaginationSearchParams,
  toPaginationValues,
} from "~/utils/pagination";
import { parsePaginationSearchParams } from "~/utils/pagination-validation";
import { parseSearchFormSearchParams } from "~/utils/search-form-validation";
import { USER_LOGIN_ROUTE } from "~/utils/user";

export async function loader({ request }: LoaderFunctionArgs) {
  const { searchParams } = new URL(request.url);
  const { searchKey, searchValue } = parseSearchFormSearchParams({
    searchKeys: BOOK_SEARCH_KEYS,
    searchParams,
  });
  const { skip, take } = parsePaginationSearchParams({ searchParams });

  const books = await getBooks({ searchKey, searchValue });
  const count = books.length;
  const data = books.slice(skip, skip + take);

  const hasData = data.length > 0;
  const hasPagination = count > take;

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
  const title = formatMetaTitle("Books");

  const description =
    data?.searchKey && data?.searchValue
      ? `${formatItemsFoundByCount({
          count: data?.count ?? 0,
          singular: "book",
          plural: "books",
        })} within '${
          BOOK_SEARCH_KEYS_LABEL_MAP[data.searchKey]
        }' containing '${data.searchValue}'.`
      : `Browse and search all your books.`;

  return [
    { title },
    { name: "description", content: description },
    ...generateSocialMeta({ title, description }),
  ];
};

export default function BooksIndexPage() {
  const loaderData = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isPending = navigation.state !== "idle";

  return (
    <Main>
      <div className="flex items-center gap-2">
        <H1>
          <Icon type="books" />
          Books <Badge aria-hidden>{loaderData.count}</Badge>
        </H1>
        <LinkButton
          to={`${USER_LOGIN_ROUTE}?redirectTo=/books/new`}
          variant="filled"
        >
          <Icon type="plus" />
          <Icon type="book" />
          <span className="sr-only">Add book</span>
        </LinkButton>
      </div>

      <SearchForm
        searchKey={loaderData.searchKey}
        searchKeys={[...BOOK_SEARCH_KEYS]}
        searchKeysLabelMap={BOOK_SEARCH_KEYS_LABEL_MAP}
        searchValue={loaderData.searchValue}
      />

      <SearchHelp count={loaderData.count} singular="book" plural="books">
        <LinkButton
          to={`${USER_LOGIN_ROUTE}?redirectTo=/books/new`}
          className="max-sm:w-full"
          size="lg"
          variant="filled"
        >
          <Icon type="plus" />
          <span>Add book</span>
        </LinkButton>{" "}
        <LinkButton
          to="."
          relative="path"
          reloadDocument
          className="max-sm:w-full"
          size="lg"
        >
          <Icon type="books" />
          <span>View all books</span>
        </LinkButton>
      </SearchHelp>

      {loaderData.hasData ? (
        <TableSelectable
          className="[&_[data-header-id=content]]:w-full [&_[data-header-id=title]]:w-1/5"
          columns={columnsBooks}
          data={loaderData.data}
        >
          {/* {({ idsSelected, idsNotSelected }) => (
            <>idsSelected: {[idsSelected]} idsNotSelected: {[idsNotSelected]}</>
          )} */}
          {loaderData.hasPagination ? (
            <FormPaginate className="flex gap-2 max-sm:-order-1">
              {loaderData.paginationSearchParams.map(([name, value]) => (
                <input
                  key={name}
                  type="hidden"
                  name={name}
                  value={value}
                  hidden
                />
              ))}
              <ButtonFirst
                name="skip"
                value={0}
                disabled={isPending || !loaderData.paginationValues.hasPrevPage}
                size="sm-icon"
                className="grow"
              />
              <ButtonPrev
                name="skip"
                value={loaderData.paginationValues.prevPageValue}
                disabled={isPending || !loaderData.paginationValues.hasPrevPage}
                size="sm-icon"
                className="grow"
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
                  className="grow"
                />
              ))}
              <ButtonNext
                name="skip"
                value={loaderData.paginationValues.nextPageValue}
                disabled={isPending || !loaderData.paginationValues.hasNextPage}
                size="sm-icon"
                className="grow"
              />
              <ButtonLast
                name="skip"
                value={loaderData.paginationValues.lastPageValue}
                disabled={isPending || !loaderData.paginationValues.hasNextPage}
                size="sm-icon"
                className="grow"
              />
            </FormPaginate>
          ) : null}
        </TableSelectable>
      ) : null}
    </Main>
  );
}

export function ErrorBoundary() {
  return <GeneralErrorBoundary />;
}
