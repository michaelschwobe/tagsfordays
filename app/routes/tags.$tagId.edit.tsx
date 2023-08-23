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
import { useId } from "react";
import invariant from "tiny-invariant";
import { ButtonDelete } from "~/components/button-delete";
import { GeneralErrorBoundary } from "~/components/error-boundary";
import { Main } from "~/components/main";
import { Button } from "~/components/ui/button";
import { FormDescription } from "~/components/ui/form-description";
import { FormLabel } from "~/components/ui/form-label";
import { FormMessage } from "~/components/ui/form-message";
import { Icon } from "~/components/ui/icon";
import { Input } from "~/components/ui/input";
import { LinkButton } from "~/components/ui/link-button";
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
    const error = { ...submission.error, "": ["Name already exists"] };
    return json({ ...submission, error }, { status: 400 });
  }

  const tag = await updateTag({ id, name: submission.value.name, userId });

  return redirect(`/tags/${tag.id}`);
};

export const meta: V2_MetaFunction<typeof loader> = ({ data }) => {
  if (!data?.tag.name) {
    return [{ title: "404: Tag Not Found" }];
  }

  const title = formatMetaTitle("Editing Tag…");

  return [{ title }];
};

export default function NewTagPage() {
  const actionData = useActionData<typeof action>();
  const loaderData = useLoaderData<typeof loader>();
  const navigation = useNavigation();

  const id = useId();
  const [form, fieldset] = useForm({
    id,
    defaultValue: {
      id: loaderData.tag.id,
      name: loaderData.tag.name,
    },
    lastSubmission: actionData!, // Lie! exactOptionalPropertyTypes mismatch
    onValidate({ formData }) {
      return parse(formData, { schema: UpdateTagFormSchema });
    },
  });

  return (
    <Main>
      <div className="mb-4 flex items-center gap-2">
        <h1 className="mr-auto flex items-center gap-2 text-xl font-semibold">
          <Icon type="pencil" />
          Edit Tag
        </h1>

        <ButtonDelete />
      </div>

      <Form method="POST" {...form.props}>
        <fieldset
          className="flex flex-col gap-4"
          disabled={["submitting", "loading"].includes(navigation.state)}
        >
          <FormMessage id={form.errorId}>{form.error}</FormMessage>

          <input
            type="hidden"
            name={fieldset.id.name}
            value={fieldset.id.defaultValue}
          />

          <div className="flex flex-col gap-1">
            <FormLabel htmlFor={fieldset.name.id}>Name</FormLabel>
            <div>
              <Input
                className="max-sm:w-full"
                {...conform.input(fieldset.name, {
                  type: "text",
                  description: true,
                })}
                autoComplete="false"
              />
            </div>
            <FormDescription id={fieldset.name.descriptionId}>
              Comma separate names, ex: <code>t1,t2,t3</code>
            </FormDescription>
            <FormMessage id={fieldset.name.errorId}>
              {fieldset.name.error}
            </FormMessage>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:w-80">
            <Button type="submit">
              <Icon type="check" />
              <span>Update</span>
            </Button>{" "}
            <LinkButton to=".." relative="path">
              <Icon type="x" />
              <span>Cancel</span>
            </LinkButton>
          </div>
        </fieldset>
      </Form>
    </Main>
  );
}

export function ErrorBoundary() {
  return (
    <GeneralErrorBoundary
      statusHandlers={{
        404: () => (
          <Main>
            <h1 className="mb-4 flex items-center gap-2 text-xl font-semibold">
              <Icon type="alert-triangle" />
              Error
            </h1>

            <p className="mb-4">Tag not found.</p>

            <div>
              <LinkButton to="/tags">
                <Icon type="tags" />
                <span>View all Tags</span>
              </LinkButton>
            </div>
          </Main>
        ),
      }}
    />
  );
}
