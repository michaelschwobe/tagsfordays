import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useNavigation } from "@remix-run/react";
import { ButtonCancel } from "~/components/button-cancel";
import { Main } from "~/components/main";
import {
  ButtonGroupOffsetPagination,
  PaginationForm,
} from "~/components/pagination";
import { SearchHelp } from "~/components/search-help";
import {
  TableBookmarksStatus,
  columnsTableBookmarksStatus,
} from "~/components/table-bookmarks-status";
import { Badge } from "~/components/ui/badge";
import { H1 } from "~/components/ui/h1";
import { Icon } from "~/components/ui/icon";
import { getBookmarks } from "~/models/bookmark.server";
import { getStatuses } from "~/models/status.server";
import {
  getOffsetPaginationFieldEntries,
  getOffsetPaginationSearchParams,
} from "~/utils/pagination.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const { skip, take } = getOffsetPaginationSearchParams({
    searchParams: url.searchParams,
    initialLimit: 20,
  });

  const bookmarks = await getBookmarks();
  const count = bookmarks.length;
  const data = await getStatuses(bookmarks.slice(skip, skip + take), 60000 * 2);
  const dataOkCount = data.filter((el) => el._meta.ok).length;
  const dataNotOkCount = Math.abs(data.length - dataOkCount);

  const fields = getOffsetPaginationFieldEntries({
    searchParams: url.searchParams,
    take,
  });
  const hasData = data.length > 0;
  const hasPagination = count > take;

  return json({
    count,
    data,
    dataOkCount,
    dataNotOkCount,
    fields,
    hasData,
    hasPagination,
    skip,
    take,
  });
}

export default function BookmarksStatusPage() {
  const loaderData = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isPending = navigation.state !== "idle";

  return (
    <Main>
      <div className="flex items-center gap-2">
        <H1>
          <Icon
            className={
              loaderData.dataNotOkCount > 5
                ? "text-pink-500"
                : loaderData.dataNotOkCount > 0
                ? "text-yellow-500"
                : "text-lime-500"
            }
            type={
              loaderData.dataNotOkCount > 0 ? "shield-alert" : "shield-check"
            }
          />
          Bookmarks Status <Badge aria-hidden>{loaderData.data.length}</Badge>
        </H1>
        <ButtonCancel to="/bookmarks" label="Bookmarks" />
      </div>

      <SearchHelp
        count={loaderData.count}
        singular="bookmark"
        plural="bookmarks"
      />

      {loaderData.hasData ? (
        <TableBookmarksStatus
          columns={columnsTableBookmarksStatus}
          data={loaderData.data}
        />
      ) : null}

      {loaderData.hasPagination ? (
        <PaginationForm>
          <fieldset disabled={isPending}>
            {loaderData.fields.map(([name, value]) => (
              <input key={name} type="hidden" name={name} value={value} />
            ))}
            <ButtonGroupOffsetPagination
              skip={loaderData.skip}
              take={loaderData.take}
              total={loaderData.count}
            />
          </fieldset>
        </PaginationForm>
      ) : null}
    </Main>
  );
}
