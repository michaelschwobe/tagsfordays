import type { LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { GeneralErrorBoundary } from "~/components/error-boundary";
import { Favorite } from "~/components/favorite";
import { Main } from "~/components/main";
import { SearchForm } from "~/components/search-form";
import { SearchHelp } from "~/components/search-help";
import { Badge } from "~/components/ui/badge";
import { FormItem } from "~/components/ui/form-item";
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

export async function loader({ request }: LoaderArgs) {
  const url = new URL(request.url);
  const searchKey = parseBookmarkSearchKey(url.searchParams.get("searchKey"));
  const searchValue = url.searchParams.get("searchValue");

  const bookmarks = await getBookmarks({ searchKey, searchValue });

  return json({ bookmarks, searchKey, searchValue });
}

export const meta: V2_MetaFunction<typeof loader> = ({ data }) => {
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

  const hasBookmarks = loaderData.bookmarks.length > 0;
  // const hasSearchValue = (loaderData.searchValue ?? "").length > 0;

  return (
    <Main>
      <div className="mb-4 flex items-center gap-2">
        <H1>
          <Icon type="bookmarks" />
          Bookmarks <Badge aria-hidden>{loaderData.bookmarks.length}</Badge>
        </H1>
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
        count={loaderData.bookmarks.length}
        singular="bookmark"
        plural="bookmarks"
      />

      {hasBookmarks ? (
        <ul className="divide-y divide-slate-300 rounded-md border border-slate-300 bg-white dark:divide-slate-600 dark:border-slate-600 dark:bg-slate-800">
          {loaderData.bookmarks.map((bookmark) => (
            <li key={bookmark.id} className="flex gap-1 p-1">
              <LinkButton
                to={`/bookmarks/${bookmark.id}`}
                className="max-w-[18rem] basis-1/3 justify-start overflow-hidden"
                variant="ghost"
              >
                <Icon type="bookmark" />
                <span className="truncate text-sm">
                  {bookmark.title ? (
                    <span>{bookmark.title}</span>
                  ) : (
                    <span aria-label="Untitled">--</span>
                  )}
                </span>
              </LinkButton>{" "}
              <LinkButton
                to={bookmark.url}
                target="_blank"
                rel="noopener noreferrer"
                className="grow justify-between overflow-hidden font-normal"
                variant="ghost"
              >
                <span className="truncate text-xs font-normal">
                  {bookmark.url}
                </span>
                <Icon type="external-link" />
              </LinkButton>{" "}
              <Favorite
                formAction={`/bookmarks/${bookmark.id}`}
                defaultValue={bookmark.favorite}
                variant="ghost"
              />
            </li>
          ))}
        </ul>
      ) : (
        <>
          <FormItem isButtonGroup>
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
          </FormItem>
          <div></div>
        </>
      )}
    </Main>
  );
}

export function ErrorBoundary() {
  return <GeneralErrorBoundary />;
}
