import type { ActionArgs, LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { GeneralErrorBoundary } from "~/components/error-boundary";
import { deleteTag, getTag } from "~/models/tag.server";
import { requireUserId } from "~/utils/auth.server";
import {
  USER_LOGIN_ROUTE,
  formatItemsFoundByCount,
  formatMetaTitle,
  toTitleCase,
} from "~/utils/misc";
import { useOptionalUser } from "~/utils/user";

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
  const action = formData.get("_action");
  const { tagId: id } = params;

  if (action === "FAVORITE") {
    console.log("🟢 FAVORITE", id);
    return null;
  }

  if (action === "SHARE") {
    // TODO: Share functionality. https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share
    console.log("🟢 SHARE", id);
    return null;
  }

  if (action === "DELETE") {
    await deleteTag({ id, userId });
    return redirect("/tags");
  }

  return null;
}

export const meta: V2_MetaFunction<typeof loader> = ({ data }) => {
  const title = formatMetaTitle(
    data?.tag.name ? `Tag: ${data.tag.name}` : "404: Tag Not Found",
  );
  return [{ title }];
};

export default function TagDetailPage() {
  const loaderData = useLoaderData<typeof loader>();
  const optionalUser = useOptionalUser();

  return (
    <main>
      <h1>{loaderData.tag.name}</h1>

      <h2>
        {toTitleCase(
          formatItemsFoundByCount({
            count: loaderData.tag.bookmarks.length,
            single: "bookmark",
            plural: "bookmarks",
          }),
        )}
      </h2>
      {loaderData.tag.bookmarks.length > 0 ? (
        <ul>
          {loaderData.tag.bookmarks.map(({ bookmark }) => (
            <li key={bookmark.id}>
              <Link to={`/bookmarks/${bookmark.id}`}>
                <div>{bookmark.title}</div>
                <div>{bookmark.url}</div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div>
          <Link to="/bookmarks">View all Bookmarks</Link>
        </div>
      )}

      {optionalUser ? (
        <Form method="post">
          <button type="submit" name="_action" value="FAVORITE">
            Favorite
          </button>
        </Form>
      ) : (
        <Link to={`${USER_LOGIN_ROUTE}?redirectTo=/tags/${loaderData.tag.id}`}>
          Favorite
        </Link>
      )}

      {optionalUser ? (
        <Form method="post">
          <button type="submit" name="_action" value="SHARE">
            Share
          </button>
        </Form>
      ) : (
        <Link to={`${USER_LOGIN_ROUTE}?redirectTo=/tags/${loaderData.tag.id}`}>
          Share
        </Link>
      )}

      <Link to="edit">Edit</Link>

      {optionalUser ? (
        <Form method="post">
          <button type="submit" name="_action" value="DELETE">
            Delete
          </button>
        </Form>
      ) : (
        <Link to={`${USER_LOGIN_ROUTE}?redirectTo=/tags/${loaderData.tag.id}`}>
          Delete
        </Link>
      )}

      <Link to="/tags">View all Tags</Link>
    </main>
  );
}

export function ErrorBoundary() {
  return (
    <GeneralErrorBoundary
      statusHandlers={{
        404: () => (
          <main>
            <h1>Error</h1>
            <p>
              Tag not found. <Link to="/tags">View all Tags</Link>
            </p>
          </main>
        ),
      }}
    />
  );
}
