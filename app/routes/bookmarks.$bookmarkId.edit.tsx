import { Prisma } from "@prisma/client";
import type { ActionArgs, LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useLoaderData } from "@remix-run/react";
import { useEffect, useRef } from "react";
import invariant from "tiny-invariant";
import { GeneralErrorBoundary } from "~/components/error-boundary";
import {
  deleteBookmark,
  getBookmark,
  updateBookmark,
} from "~/models/bookmark.server";
import { requireUserId } from "~/utils/auth.server";
import { formatMetaTitle } from "~/utils/misc";

export async function loader({ request, params }: LoaderArgs) {
  await requireUserId(request);

  invariant(params["bookmarkId"], "bookmarkId not found");
  const { bookmarkId: id } = params;

  const bookmark = await getBookmark({ id });

  if (!bookmark) {
    throw new Response("Not Found", { status: 404 });
  }

  return json({ bookmark });
}

export const action = async ({ params, request }: ActionArgs) => {
  const userId = await requireUserId(request);

  invariant(params["bookmarkId"], "bookmarkId not found");
  const { bookmarkId: id } = params;

  const formData = await request.formData();
  const action = formData.get("_action");
  const url = formData.get("url");
  const title = formData.get("title");
  const description = formData.get("description");

  if (action === "DELETE") {
    await deleteBookmark({ id, userId });
    return redirect("/bookmarks");
  }

  if (typeof url !== "string" || url.length === 0) {
    return json(
      { errors: { description: null, title: null, url: "URL is required" } },
      { status: 400 },
    );
  }

  if (typeof title !== "string" || title.length === 0) {
    return json(
      { errors: { description: null, title: "Title is required", url: null } },
      { status: 400 },
    );
  }

  if (typeof description !== "string" || description.length === 0) {
    return json(
      {
        errors: {
          description: "Description is required",
          title: null,
          url: null,
        },
      },
      { status: 400 },
    );
  }

  try {
    const bookmark = await updateBookmark({
      id,
      url,
      title,
      description,
      userId,
    });
    return redirect(`/bookmarks/${bookmark.id}`);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return json(
          {
            errors: {
              url: "URL already exists",
              title: null,
              description: null,
            },
          },
          { status: 400 },
        );
      }
    }
    throw error;
  }
};

export const meta: V2_MetaFunction<typeof loader> = ({ data }) => {
  const title = formatMetaTitle(
    data?.bookmark.title ? "Editing Bookmark…" : "404: Bookmark Not Found",
  );
  return [{ title }];
};

export default function NewBookmarkPage() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const urlRef = useRef<HTMLInputElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (actionData?.errors?.url) {
      urlRef.current?.focus();
    } else if (actionData?.errors?.title) {
      titleRef.current?.focus();
    } else if (actionData?.errors?.description) {
      descriptionRef.current?.focus();
    }
  }, [actionData]);

  return (
    <main>
      <h1>Edit Bookmark</h1>

      <Form method="post">
        <div>
          <label htmlFor="url-field">URL</label>
          <input
            ref={urlRef}
            type="url"
            id="url-field"
            name="url"
            defaultValue={loaderData.bookmark.url}
            aria-invalid={actionData?.errors?.url ? true : undefined}
            aria-errormessage={
              actionData?.errors?.url ? "url-error" : undefined
            }
          />
          {actionData?.errors?.url ? (
            <div id="url-error">{actionData.errors.url}</div>
          ) : null}
        </div>

        <div>
          <label htmlFor="title-field">Title</label>
          <input
            ref={titleRef}
            type="text"
            id="title-field"
            name="title"
            defaultValue={loaderData.bookmark.title ?? undefined}
            aria-invalid={actionData?.errors?.title ? true : undefined}
            aria-errormessage={
              actionData?.errors?.title ? "title-error" : undefined
            }
          />
          {actionData?.errors?.title ? (
            <div id="title-error">{actionData.errors.title}</div>
          ) : null}
        </div>

        <div>
          <label htmlFor="description-field">Description</label>
          <textarea
            ref={descriptionRef}
            rows={8}
            id="description-field"
            name="description"
            defaultValue={loaderData.bookmark.description ?? undefined}
            aria-invalid={actionData?.errors?.description ? true : undefined}
            aria-errormessage={
              actionData?.errors?.description ? "description-error" : undefined
            }
          />
          {actionData?.errors?.description ? (
            <div id="description-error">{actionData.errors.description}</div>
          ) : null}
        </div>

        <div>
          <button type="submit">Update</button>
        </div>
      </Form>

      <Form method="post">
        <button type="submit" name="_action" value="DELETE">
          Delete
        </button>
      </Form>
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
              Bookmark not found.{" "}
              <Link to="/bookmarks">View all Bookmarks</Link>
            </p>
          </main>
        ),
      }}
    />
  );
}
