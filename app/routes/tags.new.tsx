import { conform, useForm } from "@conform-to/react";
import { parse } from "@conform-to/zod";
import type { ActionArgs, LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { GeneralErrorBoundary } from "~/components/error-boundary";
import { createTag, getTagByName } from "~/models/tag.server";
import { requireUserId } from "~/utils/auth.server";
import { formatMetaTitle } from "~/utils/misc";
import { CreateTagFormSchema } from "~/utils/tag-validation";

export async function loader({ request }: LoaderArgs) {
  await requireUserId(request);
  return null;
}

export const action = async ({ request }: ActionArgs) => {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const submission = parse(formData, { schema: CreateTagFormSchema });

  if (!submission.value || submission.intent !== "submit") {
    return json(submission);
  }

  const tagNameFound = await getTagByName({ name: submission.value.name });

  if (tagNameFound) {
    const error = { ...submission.error, "": "Name already exists" };
    return json({ ...submission, error }, { status: 400 });
  }

  const tag = await createTag({ name: submission.value.name, userId });
  return redirect(`/tags/${tag.id}`);
};

export const meta: V2_MetaFunction = () => {
  const title = formatMetaTitle("New Tag");
  return [{ title }];
};

export default function NewTagPage() {
  const actionData = useActionData<typeof action>();

  const navigation = useNavigation();
  const disabled = ["submitting", "loading"].includes(navigation.state);

  const [form, fieldset] = useForm({
    id: "create-tag",
    lastSubmission: actionData!, // Lie! exactOptionalPropertyTypes mismatch
    onValidate({ formData }) {
      return parse(formData, { schema: CreateTagFormSchema });
    },
  });

  return (
    <main>
      <h1>New Tag</h1>

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
