import { conform, list, useFieldList, useForm } from "@conform-to/react";
import { parse } from "@conform-to/zod";
import type { ActionArgs, LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { GeneralErrorBoundary } from "~/components/error-boundary";
import { createBookmark, getBookmarkByUrl } from "~/models/bookmark.server";
import { getTags } from "~/models/tag.server";
import { requireUserId } from "~/utils/auth.server";
import { CreateBookmarkFormSchema } from "~/utils/bookmark-validation";
import { formatMetaTitle } from "~/utils/misc";

export async function loader({ request }: LoaderArgs) {
  await requireUserId(request);

  const tags = await getTags();

  return json({ tags });
}

export const action = async ({ request }: ActionArgs) => {
  const userId = await requireUserId(request);

  const formData = await request.formData();

  const submission = parse(formData, { schema: CreateBookmarkFormSchema });

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

  if (bookmarkWithSameUrl) {
    const error = { ...submission.error, "": "URL already exists" };
    return json({ ...submission, error }, { status: 400 });
  }

  const bookmark = await createBookmark({
    url,
    title,
    description,
    favorite,
    tags,
    userId,
  });

  return redirect(`/bookmarks/${bookmark.id}`);
};

export const meta: V2_MetaFunction = () => {
  const title = formatMetaTitle("New Bookmark");

  return [{ title }];
};

export default function NewBookmarkPage() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();

  const [form, fieldset] = useForm({
    id: "create-bookmark",
    lastSubmission: actionData!, // Lie! exactOptionalPropertyTypes mismatch
    onValidate({ formData }) {
      return parse(formData, { schema: CreateBookmarkFormSchema });
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
      <h1>New Bookmark</h1>

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

          <div>
            <div>
              <input
                {...conform.input(fieldset.favorite, {
                  type: "checkbox",
                  ariaAttributes: true,
                })}
              />
              <label htmlFor={fieldset.favorite.id}>Favorite</label>
            </div>
            {fieldset.favorite.error ? (
              <div id={fieldset.favorite.errorId}>
                {fieldset.favorite.error}
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
            <button type="submit">Add</button>
          </div>
        </fieldset>
      </Form>
    </main>
  );
}

export function ErrorBoundary() {
  return <GeneralErrorBoundary />;
}
