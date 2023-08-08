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
  deleteTag,
  getTag,
  getTagByName,
  updateTag,
} from "~/models/tag.server";
import { requireUserId } from "~/utils/auth.server";
import { formatMetaTitle } from "~/utils/misc";
import { TagNameSchema } from "~/utils/tag-validation";

const EditTagFormSchema = z.object({
  name: TagNameSchema,
});

function parseEditTagForm({ formData }: { formData: FormData }) {
  return parse(formData, { schema: EditTagFormSchema, stripEmptyValue: true });
}

export async function loader({ params, request }: LoaderArgs) {
  await requireUserId(request);

  invariant(params["tagId"], "tagId not found");
  const { tagId: id } = params;

  const tag = await getTag({ id });

  if (!tag) {
    throw new Response("Not Found", { status: 404 });
  }

  return json({ tag });
}

export const action = async ({ params, request }: ActionArgs) => {
  const userId = await requireUserId(request);

  invariant(params["tagId"], "tagId not found");
  const { tagId: id } = params;

  const formData = await request.formData();
  const intent = formData.get(conform.INTENT);

  if (intent === "delete") {
    await deleteTag({ id, userId });
    return redirect("/tags");
  }

  const submission = parseEditTagForm({ formData });

  if (!submission.value || submission.intent !== "submit") {
    return json(submission);
  }

  const tagNameFound = await getTagByName({ name: submission.value.name });

  if (tagNameFound) {
    const error = { ...submission.error, "": "Name already exists" };
    return json({ ...submission, error }, { status: 400 });
  }

  const tag = await updateTag({ id, name: submission.value.name, userId });
  return redirect(`/tags/${tag.id}`);
};

export const meta: V2_MetaFunction<typeof loader> = ({ data }) => {
  const title = formatMetaTitle(
    data?.tag.name ? "Editing Tag…" : "404: Tag Not Found",
  );
  return [{ title }];
};

export default function NewTagPage() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const navigation = useNavigation();
  const disabled = ["submitting", "loading"].includes(navigation.state);

  const [form, fieldset] = useForm({
    id: "edit-tag",
    defaultValue: { name: loaderData.tag.name },
    lastSubmission: actionData!,
    onValidate: parseEditTagForm,
  });

  return (
    <main>
      <h1>Edit Tag</h1>

      <Form method="post" {...form.props}>
        <fieldset disabled={disabled}>
          {form.error ? <div id={form.errorId}>{form.error}</div> : null}

          <div>
            <label htmlFor={fieldset.name.id}>Name</label>
            <input
              {...conform.input(fieldset.name, {
                type: "text",
                ariaAttributes: true,
              })}
              autoComplete="false"
            />
            {fieldset.name.error ? (
              <div id={fieldset.name.errorId}>{fieldset.name.error}</div>
            ) : null}
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
              Tag not found. <Link to="/tags">View all Tags</Link>
            </p>
          </main>
        ),
      }}
    />
  );
}
