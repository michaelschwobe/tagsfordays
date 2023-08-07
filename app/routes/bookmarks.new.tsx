import { conform, useForm } from "@conform-to/react";
import { parse } from "@conform-to/zod";
import type { ActionArgs, LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { z } from "zod";
import { GeneralErrorBoundary } from "~/components/error-boundary";
import { createBookmark, getBookmarkByUrl } from "~/models/bookmark.server";
import { getTags } from "~/models/tag.server";
import { requireUserId } from "~/utils/auth.server";
import {
  BookmarkDescriptionSchema,
  BookmarkTagsSchema,
  BookmarkTitleSchema,
  BookmarkUrlSchema,
} from "~/utils/bookmark-validation";
import { formatMetaTitle } from "~/utils/misc";

const NewBookmarkFormSchema = z.object({
  url: BookmarkUrlSchema,
  title: BookmarkTitleSchema,
  description: BookmarkDescriptionSchema,
  tags: BookmarkTagsSchema,
});

function parseNewBookmarkForm({ formData }: { formData: FormData }) {
  return parse(formData, {
    schema: NewBookmarkFormSchema,
    stripEmptyValue: true,
  });
}

export async function loader({ request }: LoaderArgs) {
  await requireUserId(request);
  const tags = await getTags();
  return json({ tags });
}

export const action = async ({ request }: ActionArgs) => {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const submission = parseNewBookmarkForm({ formData });

  if (!submission.value || submission.intent !== "submit") {
    return json(submission, { status: 400 });
  }

  const { url, title = null, description = null, tags = [] } = submission.value;

  const bookmarkUrlFound = await getBookmarkByUrl({ url });

  if (bookmarkUrlFound) {
    const error = { ...submission.error, "": "URL already exists" };
    return json({ ...submission, error }, { status: 400 });
  }

  const bookmark = await createBookmark({
    url,
    title,
    description,
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
  const disabled = ["submitting", "loading"].includes(navigation.state);

  const [form, fieldset] = useForm({
    id: "new-bookmark",
    lastSubmission: actionData!,
    onValidate: parseNewBookmarkForm,
  });

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
            <fieldset>
              <legend>Tags</legend>

              {fieldset.tags.error ? (
                <div id={fieldset.tags.errorId}>{fieldset.tags.error}</div>
              ) : null}

              {loaderData.tags.map((tag, idx) => (
                <div key={tag.name}>
                  <input
                    {...conform.input(fieldset.tags, {
                      type: "checkbox",
                      ariaAttributes: true,
                      value: tag.name,
                    })}
                    id={`${fieldset.tags.id}[${idx}]`}
                    name={`${fieldset.tags.name}[${idx}]`}
                  />
                  <label htmlFor={`${fieldset.tags.id}[${idx}]`}>
                    {tag.name}
                  </label>
                </div>
              ))}
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
