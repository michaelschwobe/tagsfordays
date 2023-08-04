import { conform, useForm } from "@conform-to/react";
import { parse } from "@conform-to/zod";
import type { ActionArgs, LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import invariant from "tiny-invariant";
import { z } from "zod";
import { GeneralErrorBoundary } from "~/components/error-boundary";
import {
  deleteBookmark,
  getBookmark,
  getBookmarkByUrl,
  updateBookmark,
} from "~/models/bookmark.server";
import { requireUserId } from "~/utils/auth.server";
import {
  BookmarkDescriptionSchema,
  BookmarkTitleSchema,
  BookmarkUrlSchema,
} from "~/utils/bookmark-validation";
import { formatMetaTitle } from "~/utils/misc";

const EditBookmarkFormSchema = z.object({
  url: BookmarkUrlSchema,
  title: BookmarkTitleSchema,
  description: BookmarkDescriptionSchema,
});

function parseEditBookmarkForm({ formData }: { formData: FormData }) {
  return parse(formData, {
    schema: EditBookmarkFormSchema,
    stripEmptyValue: true,
  });
}

export async function loader({ params, request }: LoaderArgs) {
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

  if (action === "DELETE") {
    await deleteBookmark({ id, userId });
    return redirect("/bookmarks");
  }

  const submission = parseEditBookmarkForm({ formData });

  if (!submission.value || submission.intent !== "submit") {
    return json(submission, { status: 400 });
  }

  const { url, title = null, description = null } = submission.value;

  const bookmarkUrlFound = await getBookmarkByUrl({ url });

  if (bookmarkUrlFound) {
    const error = { ...submission.error, "": "URL already exists" };
    return json({ ...submission, error }, { status: 400 });
  }

  const bookmark = await updateBookmark({
    id,
    url,
    title,
    description,
    userId,
  });
  return redirect(`/bookmarks/${bookmark.id}`);
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

  const navigation = useNavigation();
  const disabled = ["submitting", "loading"].includes(navigation.state);

  const [form, fieldset] = useForm({
    id: "new-bookmark",
    defaultValue: {
      url: loaderData.bookmark.url,
      title: loaderData.bookmark.title,
      description: loaderData.bookmark.description,
    },
    lastSubmission: actionData!,
    onValidate: parseEditBookmarkForm,
  });

  return (
    <main>
      <h1>Edit Bookmark</h1>

      <Form method="post" {...form.props}>
        <fieldset disabled={disabled}>
          {form.error ? <div id={form.errorId}>{form.error}</div> : null}

          <div>
            <label htmlFor={fieldset.url.id}>URL</label>
            <input
              {...conform.input(fieldset.url, {
                type: "url",
                ariaAttributes: true,
              })}
              autoComplete="false"
            />
            {fieldset.url.error ? (
              <div id={fieldset.url.errorId}>{fieldset.url.error}</div>
            ) : null}
          </div>

          <div>
            <label htmlFor={fieldset.title.id}>Title</label>
            <input
              {...conform.input(fieldset.title, {
                type: "text",
                ariaAttributes: true,
              })}
              autoComplete="false"
            />
            {fieldset.title.error ? (
              <div id={fieldset.title.errorId}>{fieldset.title.error}</div>
            ) : null}
          </div>

          <div>
            <label htmlFor={fieldset.description.id}>Description</label>
            <textarea
              {...conform.input(fieldset.description, {
                ariaAttributes: true,
              })}
              autoComplete="false"
              rows={8}
            />
            {fieldset.description.error ? (
              <div id={fieldset.description.errorId}>
                {fieldset.description.error}
              </div>
            ) : null}
          </div>

          {/* TODO: Tags connect or create or update */}

          <div>
            <button type="submit">Update</button>
          </div>
        </fieldset>
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
