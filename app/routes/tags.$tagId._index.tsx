import { conform } from "@conform-to/react";
import type { ActionArgs, LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Link, useLoaderData, useLocation } from "@remix-run/react";
import invariant from "tiny-invariant";
import { ButtonDelete } from "~/components/button-delete";
import { GeneralErrorBoundary } from "~/components/error-boundary";
import { Main } from "~/components/main";
import { Badge } from "~/components/ui/badge";
import { Icon } from "~/components/ui/icon";
import { LinkButton } from "~/components/ui/link-button";
import { deleteTag, getTag } from "~/models/tag.server";
import { requireUserId } from "~/utils/auth.server";
import { formatMetaTitle } from "~/utils/misc";
import { USER_LOGIN_ROUTE } from "~/utils/user";

export async function loader({ params }: LoaderArgs) {
  invariant(params["tagId"], "tagId not found");

  const { tagId: id } = params;

  const tag = await getTag({ id });

  if (!tag) {
    throw new Response("Not Found", { status: 404 });
  }

  return json({ tag });
}

export async function action({ params, request }: ActionArgs) {
  const userId = await requireUserId(request);
  invariant(params["tagId"], "tagId not found");

  const formData = await request.formData();
  const intent = formData.get(conform.INTENT);

  if (intent === "delete") {
    const { tagId: id } = params;
    await deleteTag({ id, userId });
    return redirect("/tags");
  }

  return null;
}

export const meta: V2_MetaFunction<typeof loader> = ({ data }) => {
  if (!data?.tag.name) {
    return [{ title: "404: Tag Not Found" }];
  }

  const title = formatMetaTitle(data.tag.name);
  const description = "Tag"; // TODO: Add better tag description

  return [{ title }, { name: "description", content: description }];
};

export default function TagDetailPage() {
  const loaderData = useLoaderData<typeof loader>();
  const location = useLocation();

  return (
    <Main>
      <div className="mb-4 flex items-center gap-2">
        <h1 className="mr-auto text-xl font-semibold">
          <Icon
            className="relative -top-px mr-[0.375em] inline-block"
            type="tag"
          />
          Tag
        </h1>

        <LinkButton
          to={`/bookmarks?searchValue=${loaderData.tag.name}&searchKey=tags`}
        >
          <Icon type="search" />
          <span className="sr-only">Search</span>
        </LinkButton>

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
          <div className="text-sm font-medium">Name</div>
          <div className="flex items-center py-2">
            <h2>{loaderData.tag.name}</h2>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-sm font-medium">
            Bookmarks <Badge>{loaderData.tag.bookmarks.length}</Badge>
          </div>

          <div className="flex items-center py-2">
            {loaderData.tag.bookmarks.length > 0 ? (
              <ul className="flex flex-col gap-2">
                {loaderData.tag.bookmarks.map(({ bookmark }) => (
                  <li key={bookmark.id}>
                    <Link
                      className="flex items-baseline gap-2 hover:underline"
                      to={`/bookmarks/${bookmark.id}`}
                    >
                      <Icon className="translate-y-0.5" type="bookmark" />
                      <span className="flex max-w-full flex-col overflow-hidden">
                        <span className="truncate">
                          {bookmark.title ?? "(Untitled)"}
                        </span>
                        <span className="truncate text-xs">{bookmark.url}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div>
                <LinkButton to="/bookmarks">
                  <Icon type="bookmarks" />
                  <span>View all Bookmarks</span>
                </LinkButton>
              </div>
            )}
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
            <h1 className="mb-4 text-xl font-semibold">
              <Icon
                className="relative -top-px mr-[0.375em] inline-block"
                type="alert-triangle"
              />
              Error
            </h1>

            <p className="mb-4">Tag not found.</p>

            <div>
              <LinkButton to="/tags">
                <Icon type="tags" />
                <span>View all Tags</span>
              </LinkButton>
            </div>
          </Main>
        ),
      }}
    />
  );
}
