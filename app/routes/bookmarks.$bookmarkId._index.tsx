import { conform } from "@conform-to/react";
import type { ActionArgs, LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useLocation } from "@remix-run/react";
import { ButtonDelete } from "~/components/button-delete";
import { GeneralErrorBoundary } from "~/components/error-boundary";
import { Favorite } from "~/components/favorite";
import { Main } from "~/components/main";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { FormControl } from "~/components/ui/form-control";
import { FormItem } from "~/components/ui/form-item";
import { H1 } from "~/components/ui/h1";
import { H2 } from "~/components/ui/h2";
import { Icon } from "~/components/ui/icon";
import { LinkButton } from "~/components/ui/link-button";
import {
  deleteBookmark,
  favoriteBookmark,
  getBookmark,
} from "~/models/bookmark.server";
import { requireUserId } from "~/utils/auth.server";
import { FavoriteBookmarkFormSchema } from "~/utils/bookmark-validation";
import {
  asyncShare,
  formatMetaTitle,
  invariant,
  invariantResponse,
} from "~/utils/misc";
import { redirectWithToast } from "~/utils/toast.server";
import { USER_LOGIN_ROUTE } from "~/utils/user";

export async function loader({ params }: LoaderArgs) {
  invariant(params["bookmarkId"], "bookmarkId not found");
  const { bookmarkId: id } = params;

  const bookmark = await getBookmark({ id });

  invariantResponse(bookmark, "Not Found", { status: 404 });

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
      const { favorite = null } = submission.data;
      await favoriteBookmark({ id, favorite, userId });
    }
  }

  if (intent === "delete") {
    await deleteBookmark({ id, userId });
    return redirectWithToast("/bookmarks", {
      type: "success",
      description: "Bookmark deleted.",
    });
  }

  return null;
}

export const meta: V2_MetaFunction<typeof loader> = ({ data }) => {
  if (!data?.bookmark.url) {
    return [{ title: "404: Bookmark Not Found" }];
  }

  const title = formatMetaTitle(data.bookmark.title ?? "Untitled bookmark");
  const description = `View and edit bookmark '${data.bookmark.url}'.`;

  return [{ title }, { name: "description", content: description }];
};

export default function BookmarkDetailPage() {
  const loaderData = useLoaderData<typeof loader>();
  const location = useLocation();

  return (
    <Main>
      <div className="mb-4 flex items-center gap-2">
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

      <div className="flex flex-col gap-4">
        <FormItem>
          <div className="text-sm font-medium">URL</div>
          <FormControl>
            <LinkButton
              to={loaderData.bookmark.url}
              target="_blank"
              rel="noopener noreferrer"
              className="justify-between overflow-hidden max-sm:w-full"
            >
              <span className="truncate">{loaderData.bookmark.url}</span>
              <Icon type="external-link" />
            </LinkButton>{" "}
            <Button
              type="button"
              onClick={async () => await asyncShare()}
              size="md-icon"
            >
              <Icon type="share" />
              <span className="sr-only">Share</span>
            </Button>
          </FormControl>
        </FormItem>

        <FormItem>
          <div className="text-sm font-medium">Title</div>
          <FormControl className="py-2">
            <H2>
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
          <div className="mb-2 mr-auto flex items-center gap-2 text-sm font-medium">
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
            <Favorite
              formAction={`/bookmarks/${loaderData.bookmark.id}`}
              defaultValue={loaderData.bookmark.favorite}
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
            singular="bookmark"
            className="max-sm:w-full"
            size="lg"
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
          <Main>
            <div className="mb-4 flex items-center gap-2">
              <H1>
                <Icon type="alert-triangle" />
                Error
              </H1>
            </div>

            <p className="mb-4">Bookmark not found.</p>

            <div>
              <LinkButton to="/bookmarks">
                <Icon type="bookmarks" />
                <span>View all bookmarks</span>
              </LinkButton>
            </div>
          </Main>
        ),
      }}
    />
  );
}
