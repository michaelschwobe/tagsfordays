import { conform } from "@conform-to/react";
import type { ActionArgs, LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  Link,
  useLoaderData,
  useLocation,
  useNavigation,
} from "@remix-run/react";
import invariant from "tiny-invariant";
import { GeneralErrorBoundary } from "~/components/error-boundary";
import { Icon } from "~/components/icon";
import { deleteTag, getTag } from "~/models/tag.server";
import { requireUserId } from "~/utils/auth.server";
import {
  USER_LOGIN_ROUTE,
  formatItemsFoundByCount,
  formatMetaTitle,
  toTitleCase,
  useDoubleCheck,
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
  const intent = formData.get(conform.INTENT);

  if (intent === "delete") {
    const { tagId: id } = params;
    await deleteTag({ id, userId });
    return redirect("/tags");
  }

  return null;
}

export const meta: V2_MetaFunction<typeof loader> = ({ data }) => {
  const title = data?.tag.name
    ? formatMetaTitle(data.tag.name)
    : "404: Tag Not Found";

  return [{ title }];
};

export default function TagDetailPage() {
  const loaderData = useLoaderData<typeof loader>();
  const location = useLocation();
  const navigation = useNavigation();
  const optionalUser = useOptionalUser();

  const doubleCheck = useDoubleCheck();

  return (
    <main>
      <h1>{loaderData.tag.name}</h1>

      <h2>
        {toTitleCase(
          formatItemsFoundByCount({
            count: loaderData.tag.bookmarks.length,
            single: "related bookmark",
            plural: "related bookmarks",
          }),
        )}
      </h2>
      {loaderData.tag.bookmarks.length > 0 ? (
        <ul>
          {loaderData.tag.bookmarks.map(({ bookmark }) => (
            <li key={bookmark.id}>
              <Link to={`/bookmarks/${bookmark.id}`}>
                <Icon type="bookmark" />
                <div>{bookmark.title}</div>
                <div>{bookmark.url}</div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div>
          <Link to="/bookmarks">
            <Icon type="bookmarks" />
            <span>View all Bookmarks</span>
          </Link>
        </div>
      )}

      <Link to={`${USER_LOGIN_ROUTE}?redirectTo=${location.pathname}/edit`}>
        <Icon type="pencil" />
        <span>Edit</span>
      </Link>

      {optionalUser ? (
        <Form method="POST">
          <input type="hidden" name={conform.INTENT} value="delete" />
          <button {...doubleCheck.getButtonProps({ type: "submit" })}>
            {navigation.state === "idle" ? (
              doubleCheck.isPending ? (
                <>
                  <Icon type="alert-triangle" />
                  <span>Confirm Delete</span>
                </>
              ) : (
                <>
                  <Icon type="trash-2" />
                  <span>Delete</span>
                </>
              )
            ) : (
              <>
                <Icon type="loader" />
                <span>Deleting...</span>
              </>
            )}
          </button>
        </Form>
      ) : (
        <Link to={`${USER_LOGIN_ROUTE}?redirectTo=${location.pathname}`}>
          <Icon type="trash-2" />
          <span>Delete</span>
        </Link>
      )}

      <Link to={`/bookmarks?searchValue=${loaderData.tag.name}&searchKey=tags`}>
        <Icon type="search" />
        <span>Search</span>
      </Link>

      <Link to="/tags">
        <Icon type="tags" />
        <span>View all Tags</span>
      </Link>
    </main>
  );
}

export function ErrorBoundary() {
  return (
    <GeneralErrorBoundary
      statusHandlers={{
        404: () => (
          <main>
            <h1>
              <Icon type="alert-triangle" />
              <span>Error</span>
            </h1>
            <p>
              Tag not found.{" "}
              <Link to="/tags">
                <Icon type="tags" />
                <span>View all Tags</span>
              </Link>
            </p>
          </main>
        ),
      }}
    />
  );
}
