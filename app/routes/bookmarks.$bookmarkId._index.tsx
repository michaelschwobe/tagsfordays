import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useLocation } from "@remix-run/react";
import { ButtonDelete } from "~/components/button-delete";
import { ButtonFavorite } from "~/components/button-favorite";
import { ButtonShare } from "~/components/button-share";
import { GeneralErrorBoundary, MainError } from "~/components/error-boundary";
import { Main } from "~/components/main";
import { Badge } from "~/components/ui/badge";
import { Favicon } from "~/components/ui/favicon";
import { FormControl } from "~/components/ui/form-control";
import { FormItem } from "~/components/ui/form-item";
import { H1 } from "~/components/ui/h1";
import { H2 } from "~/components/ui/h2";
import { Icon } from "~/components/ui/icon";
import { LinkButton } from "~/components/ui/link-button";
import { getBookmark } from "~/models/bookmark.server";
import { getFavicon } from "~/utils/favicon.server";
import { generateSocialMeta } from "~/utils/meta";
import { formatMetaTitle, invariant, invariantResponse } from "~/utils/misc";
import { USER_LOGIN_ROUTE } from "~/utils/user";

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params["bookmarkId"], "bookmarkId not found");
  const { bookmarkId } = params;

  const bookmark = await getBookmark({ id: bookmarkId });
  invariantResponse(bookmark, "Not Found", { status: 404 });

  const faviconSrc = await getFavicon(bookmark.url);

  const bookmarkWithMeta = { ...bookmark, _meta: { faviconSrc } };

  return json({ bookmark: bookmarkWithMeta });
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data?.bookmark.url) {
    return [{ title: "404: Bookmark Not Found" }];
  }

  const title = formatMetaTitle(data.bookmark.title ?? "Untitled bookmark");
  const description = `View and edit bookmark '${data.bookmark.url}'.`;

  return [
    { title },
    { name: "description", content: description },
    ...generateSocialMeta({ title, description }),
  ];
};

export default function BookmarkDetailPage() {
  const loaderData = useLoaderData<typeof loader>();
  const location = useLocation();

  return (
    <Main>
      <div className="flex items-center gap-2">
        <H1>
          <Icon type="bookmark" />
          Bookmark
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

      <div className="space-y-4 sm:space-y-8">
        <FormItem>
          <div className="text-sm font-medium">URL</div>
          <FormControl>
            <LinkButton
              to={loaderData.bookmark.url}
              target="_blank"
              rel="noopener noreferrer"
              className="justify-start overflow-hidden max-sm:w-full"
            >
              <Icon type="external-link" />
              <span className="truncate">{loaderData.bookmark.url}</span>
            </LinkButton>{" "}
            <ButtonShare />
          </FormControl>
        </FormItem>

        <FormItem>
          <div className="text-sm font-medium">Title</div>
          <FormControl className="py-2">
            <H2 className="flex items-center gap-3">
              <Favicon src={loaderData.bookmark._meta.faviconSrc} />
              {loaderData.bookmark.title ? (
                <span>{loaderData.bookmark.title}</span>
              ) : (
                <span aria-label="Untitled">--</span>
              )}
            </H2>
          </FormControl>
        </FormItem>

        <FormItem>
          <div className="text-sm font-medium">Content</div>
          <FormControl className="py-2">
            <p className="text-black dark:text-white">
              {loaderData.bookmark.content ? (
                <span>{loaderData.bookmark.content}</span>
              ) : (
                <span aria-label="Undescribed">--</span>
              )}
            </p>
          </FormControl>
        </FormItem>

        <FormItem>
          <div className="mr-auto flex items-center gap-2 text-sm font-medium">
            Tags <Badge aria-hidden>{loaderData.bookmark.tags.length}</Badge>
          </div>
          <FormControl>
            {loaderData.bookmark.tags.length > 0 ? (
              <ul className="flex flex-wrap gap-2">
                {loaderData.bookmark.tags.map(({ tag }) => (
                  <li key={tag.id}>
                    <LinkButton
                      to={`/tags/${tag.id}`}
                      className="max-w-[11rem]"
                      size="sm"
                    >
                      <Icon type="tag" />
                      <span className="truncate">{tag.name}</span>
                    </LinkButton>
                  </li>
                ))}
              </ul>
            ) : (
              <div>
                <LinkButton to="/tags">
                  <Icon type="tags" />
                  <span>View all Tags</span>
                </LinkButton>
              </div>
            )}
          </FormControl>
        </FormItem>

        <FormItem>
          <div className="text-sm font-medium">Favorite</div>
          <FormControl>
            <ButtonFavorite
              formAction={`/bookmarks/${loaderData.bookmark.id}/edit`}
              isFavorite={Boolean(loaderData.bookmark.favorite)}
              size="sm"
            />
          </FormControl>
        </FormItem>

        <FormItem isButtonGroup>
          <LinkButton
            to={`${USER_LOGIN_ROUTE}?redirectTo=${location.pathname}/edit`}
            className="max-sm:w-full"
            size="lg"
            variant="filled"
          >
            <Icon type="pencil" />
            <span>Edit bookmark</span>
          </LinkButton>{" "}
          <ButtonDelete
            formAction={`/bookmarks/${loaderData.bookmark.id}/edit`}
            label="bookmark"
            size="lg"
            className="max-sm:w-full"
          />
        </FormItem>
      </div>
    </Main>
  );
}

export function ErrorBoundary() {
  return (
    <GeneralErrorBoundary
      statusHandlers={{
        404: () => (
          <MainError>
            <p>Bookmark not found.</p>
            <div>
              <LinkButton to="/bookmarks">
                <Icon type="bookmarks" />
                <span>View all bookmarks</span>
              </LinkButton>
            </div>
          </MainError>
        ),
      }}
    />
  );
}
