import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { defer } from "@remix-run/node";
import { Await, useLoaderData } from "@remix-run/react";
import { Suspense } from "react";
import { ButtonFirst } from "~/components/button-first";
import { ButtonLast } from "~/components/button-last";
import { ButtonNext } from "~/components/button-next";
import { ButtonPage } from "~/components/button-page";
import { ButtonPrev } from "~/components/button-prev";
import { FormPaginate } from "~/components/form-paginate";
import { Main } from "~/components/main";
import { SearchHelp } from "~/components/search-help";
import { StatusTr } from "~/components/status-tr";
import { Badge } from "~/components/ui/badge";
import { H1 } from "~/components/ui/h1";
import { Icon } from "~/components/ui/icon";
import { LinkButton } from "~/components/ui/link-button";
import {
  Table,
  TableWrapper,
  Tbody,
  Th,
  Thead,
  Tr,
} from "~/components/ui/table";
import {
  getBookmarksCount,
  getBookmarksStatus,
} from "~/models/bookmark.server";
import { requireUserId } from "~/utils/auth.server";
import type { Handle } from "~/utils/matches-validation";
import { formatMetaTitle } from "~/utils/misc";
import {
  toPaginationSearchParams,
  toPaginationValues,
} from "~/utils/pagination";
import { parsePaginationSearchParams } from "~/utils/pagination-validation";
import type { GetStatusData } from "~/utils/status.server";
import { getStatus } from "~/utils/status.server";

export const handle = {
  /**
   * This value is used to abort the fetch request after a certain delay.
   * Why: It takes ~8s to resolve 20 items, but the default is 5s.
   */
  abortDelay: 8_000,
  /**
   * This value disables the <Script> tag in root.tsx.
   * Why: Solves hydration mismatch with `getStatus`, <Suspense> and <Await>.
   */
  isDehydrated: true,
} satisfies Handle;

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUserId(request);

  const { searchParams } = new URL(request.url);
  const { skip, take } = parsePaginationSearchParams({ searchParams });

  const [bookmarks, count] = await Promise.all([
    getBookmarksStatus({ skip, take }),
    getBookmarksCount(),
  ]);
  const data = bookmarks.map((bookmark) => ({
    ...bookmark,
    _meta: getStatus(bookmark.url, handle.abortDelay),
  }));

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

  return defer({
    count,
    data,
    hasData,
    hasPagination,
    paginationSearchParams,
    paginationValues,
  });
}

export const meta: MetaFunction<typeof loader> = () => {
  return [{ title: formatMetaTitle("Status") }];
};

export default function BookmarksStatusPage() {
  const loaderData = useLoaderData<typeof loader>();

  return (
    <Main>
      <div className="flex items-center gap-2">
        <H1>
          <Icon type="shield" />
          Status <Badge aria-hidden>{loaderData.count}</Badge>
        </H1>
        <LinkButton to="/bookmarks/status/all" reloadDocument size="md-icon">
          <Icon type="shield-alert" />
          <span className="sr-only">Verify all &amp; filter</span>
        </LinkButton>
      </div>

      <SearchHelp
        count={loaderData.count}
        singular="bookmark"
        plural="bookmarks"
      />

      {loaderData.hasData ? (
        <TableWrapper>
          <Table>
            <Thead>
              <Tr>
                <Th>
                  <Icon type="pencil" className="mx-auto" />
                  <span className="sr-only">Edit</span>
                </Th>
                <Th className="max-sm:px-0">
                  <Icon type="shield" className="mx-auto" />
                  <span className="sr-only">Status Code</span>
                </Th>
                <Th className="w-full">
                  <span className="block px-3 text-left">URL</span>
                </Th>
                <Th className="max-sm:px-0">
                  <Icon type="info" className="ml-3 mr-auto" />
                  <span className="sr-only">Status Text</span>
                </Th>
                <Th>
                  <Icon type="trash" className="mx-auto" />
                  <span className="sr-only">Delete</span>
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {loaderData.data.map((row) => (
                <Suspense
                  fallback={
                    <StatusTr
                      id={row.id}
                      url={row.url}
                      statusCode={null}
                      statusText={null}
                    />
                  }
                  key={row.id}
                >
                  <Await resolve={row._meta}>
                    {(rowMeta) => (
                      <StatusTr
                        id={row.id}
                        url={row.url}
                        /* 🤷‍♂️ The only property in rowMeta is a Symbol? */
                        statusCode={
                          (rowMeta as unknown as GetStatusData)?.status
                        }
                        statusText={
                          (rowMeta as unknown as GetStatusData)?.statusText
                        }
                      />
                    )}
                  </Await>
                </Suspense>
              ))}
            </Tbody>
          </Table>
        </TableWrapper>
      ) : null}

      {loaderData.hasPagination ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
          <div className="flex items-center gap-2.5 max-sm:h-10 max-sm:justify-center">
            <span className="whitespace-nowrap text-sm tabular-nums">
              Displaying {loaderData.data.length} of {loaderData.count} results.
            </span>
          </div>
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
              disabled={!loaderData.paginationValues.hasPrevPage}
              size="sm-icon"
              className="grow"
            />
            <ButtonPrev
              name="skip"
              value={loaderData.paginationValues.prevPageValue}
              disabled={!loaderData.paginationValues.hasPrevPage}
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
                disabled={!el.isSkipPage}
                size="sm-icon"
                variant={el.isCurrPage ? "ghost" : undefined}
                className="grow"
              />
            ))}
            <ButtonNext
              name="skip"
              value={loaderData.paginationValues.nextPageValue}
              disabled={!loaderData.paginationValues.hasNextPage}
              size="sm-icon"
              className="grow"
            />
            <ButtonLast
              name="skip"
              value={loaderData.paginationValues.lastPageValue}
              disabled={!loaderData.paginationValues.hasNextPage}
              size="sm-icon"
              className="grow"
            />
          </FormPaginate>
        </div>
      ) : null}
    </Main>
  );
}
