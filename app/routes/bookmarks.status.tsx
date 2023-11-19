import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useNavigation } from "@remix-run/react";
import { ButtonCancel } from "~/components/button-cancel";
import { ButtonFirst } from "~/components/button-first";
import { ButtonLast } from "~/components/button-last";
import { ButtonNext } from "~/components/button-next";
import { ButtonPage } from "~/components/button-page";
import { ButtonPrev } from "~/components/button-prev";
import { FormPaginate } from "~/components/form-paginate";
import { Main } from "~/components/main";
import { SearchHelp } from "~/components/search-help";
import { columnsBookmarksStatus } from "~/components/table-columns";
import { TableSelectable } from "~/components/table-selectable";
import { Badge } from "~/components/ui/badge";
import { H1 } from "~/components/ui/h1";
import { Icon } from "~/components/ui/icon";
import { getBookmarks } from "~/models/bookmark.server";
import { parseBookmarkSearchParams } from "~/utils/bookmark-validation";
import { cn, formatMetaTitle } from "~/utils/misc";
import {
  toPaginationSearchParams,
  toPaginationValues,
} from "~/utils/pagination";
import { getStatuses } from "~/utils/status.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { searchParams } = new URL(request.url);
  const { skip, take } = parseBookmarkSearchParams(searchParams);

  const bookmarks = await getBookmarks();
  const count = bookmarks.length;
  const data = await getStatuses(bookmarks.slice(skip, skip + take), 60000 * 2);

  const countOk = data.filter((el) => el._meta.ok).length;
  const countNotOk = Math.abs(data.length - countOk);
  const risk = countNotOk > 5 ? 2 : countNotOk > 0 ? 1 : 0;

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
    countNotOk,
    countOk,
    data,
    hasData,
    hasPagination,
    paginationSearchParams,
    paginationValues,
    risk,
  });
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  let dot = "⚪️";
  if (data) dot = "🟢";
  if (data && data.risk > 0) dot = "🟡";
  if (data && data.risk > 1) dot = "🔴";
  const title = [dot, "Bookmarks Status"].join(" ");
  return [{ title: formatMetaTitle(title) }];
};

export default function BookmarksStatusPage() {
  const loaderData = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isPending = navigation.state !== "idle";

  return (
    <Main>
      <div className="flex items-center gap-2">
        <H1>
          <Icon
            className={cn(
              "text-green-500",
              loaderData.risk > 0 && "text-yellow-500",
              loaderData.risk > 1 && "text-pink-500",
            )}
            type={loaderData.risk > 0 ? "shield-alert" : "shield-check"}
          />
          Bookmarks Status <Badge aria-hidden>{loaderData.count}</Badge>
        </H1>
        <ButtonCancel to="/bookmarks" label="Bookmarks" />
      </div>

      <SearchHelp
        count={loaderData.count}
        singular="bookmark"
        plural="bookmarks"
      />

      {loaderData.hasData ? (
        <TableSelectable
          className="[&_[data-header-id=title]]:w-1/5 [&_[data-header-id=url]]:w-full"
          columns={columnsBookmarksStatus}
          data={loaderData.data}
        >
          {loaderData.hasPagination ? (
            <FormPaginate className="flex gap-2 max-sm:-order-1">
              {loaderData.paginationSearchParams.map(([name, value]) => (
                <input key={name} type="hidden" name={name} value={value} />
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
