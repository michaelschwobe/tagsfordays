import { conform, list, useFieldList, useForm } from "@conform-to/react";
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
import { GeneralErrorBoundary } from "~/components/error-boundary";
import {
  deleteBookmark,
  getBookmark,
  getBookmarkByUrl,
  updateBookmark,
} from "~/models/bookmark.server";
import { getTags } from "~/models/tag.server";
import { requireUserId } from "~/utils/auth.server";
import { UpdateBookmarkFormSchema } from "~/utils/bookmark-validation";
import { formatMetaTitle } from "~/utils/misc";

export async function loader({ params, request }: LoaderArgs) {
  await requireUserId(request);

  invariant(params["bookmarkId"], "bookmarkId not found");
  const { bookmarkId: id } = params;

  const bookmark = await getBookmark({ id });

  if (!bookmark) {
    throw new Response("Not Found", { status: 404 });
  }

  const tags = await getTags();

  return json({ bookmark, tags });
}

export const action = async ({ params, request }: ActionArgs) => {
  const userId = await requireUserId(request);

  invariant(params["bookmarkId"], "bookmarkId not found");
  const { bookmarkId: id } = params;

  const formData = await request.formData();
  const intent = formData.get(conform.INTENT);

  if (intent === "delete") {
    await deleteBookmark({ id, userId });
    return redirect("/bookmarks");
  }

  const submission = parse(formData, { schema: UpdateBookmarkFormSchema });

  if (!submission.value || submission.intent !== "submit") {
    return json(submission);
  }

  const { url, title = null, description = null, tags = [] } = submission.value;

  const bookmarkWithSameUrl = await getBookmarkByUrl({ url });

  if (bookmarkWithSameUrl && bookmarkWithSameUrl.id !== id) {
    const error = { ...submission.error, "": "URL already exists" };
    return json({ ...submission, error }, { status: 400 });
  }

  const bookmark = await updateBookmark({
    id,
    url,
    title,
    description,
    tags,
    userId,
  });

  return redirect(`/bookmarks/${bookmark.id}`);
};

export const meta: V2_MetaFunction<typeof loader> = ({ data }) => {
  const title = formatMetaTitle(
    data?.bookmark.title ? "Editing Bookmark…" : "404: Bookmark Not Found",
  );
  const description = "Bookmark"; // TODO: Add description

  return [{ title }, { name: "description", content: description }];
};

export default function NewBookmarkPage() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();

  const [form, fieldset] = useForm({
    id: "update-bookmark",
    defaultValue: {
      id: loaderData.bookmark.id,
      url: loaderData.bookmark.url,
      title: loaderData.bookmark.title,
      description: loaderData.bookmark.description,
      tags: loaderData.bookmark.tags.map((el) => el.tag.name),
    },
    lastSubmission: actionData!, // Lie! exactOptionalPropertyTypes mismatch
    onValidate({ formData }) {
      return parse(formData, { schema: UpdateBookmarkFormSchema });
    },
  });
  const tagsList = useFieldList(form.ref, fieldset.tags);

  const disabled = ["submitting", "loading"].includes(navigation.state);
  const tagsSelected = tagsList.filter((el) => el.defaultValue != null);
  const tagsNotSelected = loaderData.tags.filter(
    (el) => !tagsSelected.map((el) => el.defaultValue).includes(el.name),
  );

  return (
    <main>
      <h1>Edit Bookmark</h1>

      <Form method="post" {...form.props}>
        <fieldset disabled={disabled}>
          {form.error ? <div id={form.errorId}>{form.error}</div> : null}

          <input
            type="hidden"
            name={fieldset.id.name}
            value={fieldset.id.defaultValue}
          />

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

          <div>
            <fieldset>
              <legend>Tags</legend>

              <div>
                {tagsSelected.map((tag, index) => (
                  <span key={tag.key}>
                    <input
                      type="hidden"
                      name={tag.name}
                      value={tag.defaultValue}
                    />{" "}
                    <button {...list.remove(fieldset.tags.name, { index })}>
                      <span className="sr-only">Remove</span> {tag.defaultValue}
                      <span aria-hidden="true">&times;</span>
                    </button>
                  </span>
                ))}
              </div>

              <div>
                {tagsNotSelected.map((tag) => (
                  <button
                    {...list.append(fieldset.tags.name, {
                      defaultValue: tag.name,
                    })}
                    key={tag.name}
                  >
                    <span className="sr-only">Add</span>{" "}
                    <span aria-hidden="true">+</span>
                    {tag.name}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>

          <div>
            <button type="submit">Update</button>
          </div>
        </fieldset>
      </Form>

      <Form method="post">
        <button type="submit" name={conform.INTENT} value="delete">
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
