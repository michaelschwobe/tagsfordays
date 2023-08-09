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
import { GeneralErrorBoundary } from "~/components/error-boundary";
import {
  deleteTag,
  getTag,
  getTagByName,
  updateTag,
} from "~/models/tag.server";
import { requireUserId } from "~/utils/auth.server";
import { formatMetaTitle } from "~/utils/misc";
import { UpdateTagFormSchema } from "~/utils/tag-validation";

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

  const submission = parse(formData, { schema: UpdateTagFormSchema });

  if (!submission.value || submission.intent !== "submit") {
    return json(submission);
  }

  const tagWithSameName = await getTagByName({ name: submission.value.name });

  if (tagWithSameName && tagWithSameName.id !== id) {
    const error = { ...submission.error, "": "Name already exists" };
    return json({ ...submission, error }, { status: 400 });
  }

  const tag = await updateTag({ id, name: submission.value.name, userId });

  return redirect(`/tags/${tag.id}`);
};

export const meta: V2_MetaFunction<typeof loader> = ({ data }) => {
  const title = data?.tag
    ? formatMetaTitle("Editing Tag…")
    : "404: Tag Not Found";

  return [{ title }];
};

export default function NewTagPage() {
  const actionData = useActionData<typeof action>();
  const loaderData = useLoaderData<typeof loader>();
  const navigation = useNavigation();

  const [form, fieldset] = useForm({
    id: "update-tag",
    defaultValue: {
      id: loaderData.tag.id,
      name: loaderData.tag.name,
    },
    lastSubmission: actionData!, // Lie! exactOptionalPropertyTypes mismatch
    onValidate({ formData }) {
      return parse(formData, { schema: UpdateTagFormSchema });
    },
  });

  const disabled = ["submitting", "loading"].includes(navigation.state);

  return (
    <main>
      <h1>Edit Tag</h1>

      <Form method="post" {...form.props}>
        <fieldset disabled={disabled}>
          {form.error ? <div id={form.errorId}>{form.error}</div> : null}

          <input
            type="hidden"
            name={fieldset.id.name}
            value={fieldset.id.defaultValue}
          />

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
