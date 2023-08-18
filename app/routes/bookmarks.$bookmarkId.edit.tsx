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
import { Icon } from "~/components/icon";
import {
  deleteBookmark,
  getBookmark,
  getBookmarkByUrl,
  updateBookmark,
} from "~/models/bookmark.server";
import { getTags } from "~/models/tag.server";
import { requireUserId } from "~/utils/auth.server";
import { UpdateBookmarkFormSchema } from "~/utils/bookmark-validation";
import { formatMetaTitle, useDoubleCheck } from "~/utils/misc";

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

  const {
    url,
    title = null,
    description = null,
    favorite = null,
    tags = [],
  } = submission.value;

  const bookmarkWithSameUrl = await getBookmarkByUrl({ url });

  if (bookmarkWithSameUrl && bookmarkWithSameUrl.id !== id) {
    const error = { ...submission.error, "": ["URL already exists"] };
    return json({ ...submission, error }, { status: 400 });
  }

  const bookmark = await updateBookmark({
    id,
    url,
    title,
    description,
    favorite,
    tags,
    userId,
  });

  return redirect(`/bookmarks/${bookmark.id}`);
};

export const meta: V2_MetaFunction<typeof loader> = ({ data }) => {
  const title = data?.bookmark
    ? formatMetaTitle("Editing Bookmark…")
    : "404: Bookmark Not Found";

  return [{ title }];
};

export default function NewBookmarkPage() {
  const actionData = useActionData<typeof action>();
  const loaderData = useLoaderData<typeof loader>();
  const navigation = useNavigation();

  const doubleCheck = useDoubleCheck();

  const [form, fieldset] = useForm({
    id: "update-bookmark",
    defaultValue: {
      id: loaderData.bookmark.id,
      url: loaderData.bookmark.url,
      title: loaderData.bookmark.title,
      description: loaderData.bookmark.description,
      favorite: loaderData.bookmark.favorite === true ? "on" : undefined,
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

      <Form method="POST" {...form.props}>
        <fieldset disabled={disabled}>
          {form.error ? (
            <div id={form.errorId}>
              <Icon type="alert-triangle" />
              <span>{form.error}</span>
            </div>
          ) : null}

          <input
            type="hidden"
            name={fieldset.id.name}
            value={fieldset.id.defaultValue}
          />

          <div>
            <label htmlFor={fieldset.url.id}>URL</label>
            <input
              {...conform.input(fieldset.url, { type: "url" })}
              autoComplete="false"
            />
            {fieldset.url.error ? (
              <div id={fieldset.url.errorId}>
                <Icon type="alert-triangle" />
                <span>{fieldset.url.error}</span>
              </div>
            ) : null}
          </div>

          <div>
            <label htmlFor={fieldset.title.id}>Title</label>
            <input
              {...conform.input(fieldset.title, { type: "text" })}
              autoComplete="false"
            />
            {fieldset.title.error ? (
              <div id={fieldset.title.errorId}>
                <Icon type="alert-triangle" />
                <span></span>
                {fieldset.title.error}
              </div>
            ) : null}
          </div>

          <div>
            <label htmlFor={fieldset.description.id}>Description</label>
            <textarea
              {...conform.textarea(fieldset.description)}
              autoComplete="false"
              rows={8}
            />
            {fieldset.description.error ? (
              <div id={fieldset.description.errorId}>
                <Icon type="alert-triangle" />
                <span>{fieldset.description.error}</span>
              </div>
            ) : null}
          </div>

          <div>
            <div>
              <input
                {...conform.input(fieldset.favorite, { type: "checkbox" })}
              />
              <label htmlFor={fieldset.favorite.id}>Favorite</label>
            </div>
            {fieldset.favorite.error ? (
              <div id={fieldset.favorite.errorId}>
                <Icon type="alert-triangle" />
                <span>{fieldset.favorite.error}</span>
              </div>
            ) : null}
          </div>

          <div>
            <fieldset>
              <legend>
                <Icon type="tags" />
                <span>Tags</span>
              </legend>

              <div>
                {tagsSelected.map((tag, index) => (
                  <span key={tag.key}>
                    <input
                      type="hidden"
                      name={tag.name}
                      value={tag.defaultValue}
                    />{" "}
                    <button {...list.remove(fieldset.tags.name, { index })}>
                      <span className="sr-only">Remove</span>{" "}
                      <span>{tag.defaultValue}</span>
                      <Icon type="x" />
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
                    <Icon type="plus" />
                    <span className="sr-only">Add</span> <span>{tag.name}</span>
                  </button>
                ))}
              </div>
            </fieldset>
          </div>

          <div>
            <button type="submit">
              <Icon type="check" />
              <span>Update</span>
            </button>{" "}
            <Link to=".." relative="path">
              <Icon type="x" />
              <span>Cancel</span>
            </Link>
          </div>
        </fieldset>
      </Form>

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
              Bookmark not found.{" "}
              <Link to="/bookmarks">
                <Icon type="bookmarks" />
                <span>View all Bookmarks</span>
              </Link>
            </p>
          </main>
        ),
      }}
    />
  );
}
