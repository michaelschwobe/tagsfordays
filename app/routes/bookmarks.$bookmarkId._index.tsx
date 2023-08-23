import { conform } from "@conform-to/react";
import type { ActionArgs, LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, useLocation } from "@remix-run/react";
import invariant from "tiny-invariant";
import { ButtonDelete } from "~/components/button-delete";
import { ButtonFavorite } from "~/components/button-favorite";
import { GeneralErrorBoundary } from "~/components/error-boundary";
import { Main } from "~/components/main";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Icon } from "~/components/ui/icon";
import { LinkButton } from "~/components/ui/link-button";
import {
  deleteBookmark,
  favoriteBookmark,
  getBookmark,
} from "~/models/bookmark.server";
import { requireUserId } from "~/utils/auth.server";
import { FavoriteBookmarkFormSchema } from "~/utils/bookmark-validation";
import { asyncShare, formatMetaTitle } from "~/utils/misc";
import { USER_LOGIN_ROUTE } from "~/utils/user";

export async function loader({ params }: LoaderArgs) {
  invariant(params["bookmarkId"], "bookmarkId not found");
  const { bookmarkId: id } = params;

  const bookmark = await getBookmark({ id });

  if (!bookmark) {
    throw new Response("Not Found", { status: 404 });
  }

  return json({ bookmark });
}

export async function action({ params, request }: ActionArgs) {
  const userId = await requireUserId(request);

  invariant(params["bookmarkId"], "bookmarkId not found");
  const { bookmarkId: id } = params;

  const formData = await request.formData();
  const intent = formData.get(conform.INTENT);

  if (intent === "favorite") {
    const formFields = Object.fromEntries(formData.entries());
    const submission = FavoriteBookmarkFormSchema.safeParse(formFields);
    if (submission.success) {
      const { id, favorite = null } = submission.data;
      await favoriteBookmark({ id, favorite, userId });
    }
  }

  if (intent === "delete") {
    await deleteBookmark({ id, userId });
    return redirect("/bookmarks");
  }

  return null;
}

export const meta: V2_MetaFunction<typeof loader> = ({ data }) => {
  if (!data?.bookmark.url) {
    return [{ title: "404: Bookmark Not Found" }];
  }

  const title = formatMetaTitle(data.bookmark.title ?? "(Untitled)");
  const description = data?.bookmark.description ?? "Bookmark"; // TODO: Add better bookmark description

  return [{ title }, { name: "description", content: description }];
};

export default function BookmarkDetailPage() {
  const loaderData = useLoaderData<typeof loader>();
  const location = useLocation();

  return (
    <Main>
      <div className="mb-4 flex items-center gap-2">
        <h1 className="mr-auto flex items-center gap-2 text-xl font-semibold">
          <Icon type="bookmark" />
          Bookmark
        </h1>

        <Button type="button" onClick={async () => await asyncShare()}>
          <Icon type="share" />
          <span className="sr-only">Share</span>
        </Button>

        <LinkButton
          to={`${USER_LOGIN_ROUTE}?redirectTo=${location.pathname}/edit`}
        >
          <Icon type="pencil" />
          <span className="sr-only">Edit</span>
        </LinkButton>

        <ButtonDelete />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <div className="text-sm font-medium">URL</div>
          <div>
            <LinkButton
              className="overflow-hidden max-sm:w-full"
              to={loaderData.bookmark.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="truncate">{loaderData.bookmark.url}</span>
              <Icon type="external-link" />
            </LinkButton>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="text-sm font-medium">Title</div>
          <div className="flex items-center py-2">
            <h2 className="text-lg font-semibold">
              {loaderData.bookmark.title ?? "(Untitled)"}
            </h2>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="text-sm font-medium">Description</div>
          <div className="flex items-center py-2">
            <p>{loaderData.bookmark.description}</p>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="mr-auto flex items-center gap-2 text-sm font-medium">
            Tags <Badge>{loaderData.bookmark.tags.length}</Badge>
          </div>
          <div className="flex items-center py-2">
            {loaderData.bookmark.tags.length > 0 ? (
              <ul className="flex flex-wrap gap-2">
                {loaderData.bookmark.tags.map(({ tag }) => (
                  <li key={tag.id}>
                    <LinkButton to={`/tags/${tag.id}`}>
                      <Icon type="tag" />
                      <span>{tag.name}</span>
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
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="text-sm font-medium">Favorite</div>
          <div>
            <ButtonFavorite
              entityId={loaderData.bookmark.id}
              entityValue={loaderData.bookmark.favorite}
            />
          </div>
        </div>
      </div>
    </Main>
  );
}

export function ErrorBoundary() {
  return (
    <GeneralErrorBoundary
      statusHandlers={{
        404: () => (
          <Main>
            <h1 className="mb-4 flex items-center gap-2 text-xl font-semibold">
              <Icon type="alert-triangle" />
              Error
            </h1>

            <p className="mb-4">Bookmark not found.</p>

            <div>
              <LinkButton to="/bookmarks">
                <Icon type="bookmarks" />
                <span>View all Bookmarks</span>
              </LinkButton>
            </div>
          </Main>
        ),
      }}
    />
  );
}
