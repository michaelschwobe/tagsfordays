import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { defer } from "@remix-run/node";
import { Await, useLoaderData } from "@remix-run/react";
import { Suspense } from "react";
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
import { getBookmarksStatus } from "~/models/bookmark.server";
import { requireUserId } from "~/utils/auth.server";
import type { Handle } from "~/utils/matches-validation";
import { formatMetaTitle } from "~/utils/misc";
import type { GetStatusData } from "~/utils/status.server";
import { getStatus } from "~/utils/status.server";

export const handle = {
  /**
   * This value is used to abort the fetch request after a certain delay.
   * Why: It takes ~2min to resolve 1000+ items, but the default is 5s.
   */
  abortDelay: 120_000,
  /**
   * This value disables the <Script> tag in root.tsx.
   * Why: Solves hydration mismatch with `getStatus`, <Suspense> and <Await>.
   */
  isDehydrated: true,
} satisfies Handle;

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUserId(request);

  const bookmarks = await getBookmarksStatus();
  const count = bookmarks.length;
  const data = bookmarks.map((bookmark) => ({
    ...bookmark,
    _meta: getStatus(bookmark.url, handle.abortDelay),
  }));

  const hasData = data.length > 0;

  return defer({
    count,
    data,
    hasData,
  });
}

export const meta: MetaFunction<typeof loader> = () => {
  return [{ title: formatMetaTitle("All Status") }];
};

export default function BookmarksStatusAllPage() {
  const loaderData = useLoaderData<typeof loader>();

  return (
    <Main>
      <div className="flex items-center gap-2">
        <H1>
          <Icon type="shield-alert" />
          All Status <Badge aria-hidden>{loaderData.count}</Badge>
        </H1>
        <LinkButton to="/bookmarks/status" reloadDocument size="md-icon">
          <Icon type="shield" />
          <span className="sr-only">Verify subset &amp; paginate</span>
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
                        isOkHidden
                      />
                    )}
                  </Await>
                </Suspense>
              ))}
            </Tbody>
          </Table>
        </TableWrapper>
      ) : null}
    </Main>
  );
}
