import { conform, useForm } from "@conform-to/react";
import { parse } from "@conform-to/zod";
import type { ActionArgs, LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { useId } from "react";
import { GeneralErrorBoundary } from "~/components/error-boundary";
import { Main } from "~/components/main";
import { Button } from "~/components/ui/button";
import { FormControl } from "~/components/ui/form-control";
import { FormDescription } from "~/components/ui/form-description";
import { FormItem } from "~/components/ui/form-item";
import { FormLabel } from "~/components/ui/form-label";
import { FormMessage } from "~/components/ui/form-message";
import { H1 } from "~/components/ui/h1";
import { Icon } from "~/components/ui/icon";
import { Input } from "~/components/ui/input";
import { LinkButton } from "~/components/ui/link-button";
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

  const tagWithSameName = await getTagByName({ name: submission.value.name });

  if (tagWithSameName) {
    const error = { ...submission.error, "": ["Name already exists"] };
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

  const id = useId();
  const [form, fieldset] = useForm({
    id,
    lastSubmission: actionData!, // Lie! exactOptionalPropertyTypes mismatch
    onValidate({ formData }) {
      return parse(formData, { schema: CreateTagFormSchema });
    },
  });

  return (
    <Main>
      <H1 className="mb-4 flex items-center gap-2">
        <Icon type="plus" />
        New Tag
      </H1>

      <Form method="POST" {...form.props}>
        <fieldset
          className="flex flex-col gap-4"
          disabled={["submitting", "loading"].includes(navigation.state)}
        >
          <FormMessage id={form.errorId}>{form.error}</FormMessage>

          <FormItem>
            <FormLabel htmlFor={fieldset.name.id}>Name</FormLabel>
            <FormControl>
              <Input
                className="max-sm:w-full"
                {...conform.input(fieldset.name, {
                  type: "text",
                  description: true,
                })}
                autoComplete="false"
              />
            </FormControl>
            <FormDescription id={fieldset.name.descriptionId}>
              Comma separate names, ex: <code>t1,t2,t3</code>
            </FormDescription>
            <FormMessage id={fieldset.name.errorId}>
              {fieldset.name.error}
            </FormMessage>
          </FormItem>

          <FormItem className="sm:w-80" isButtonGroup>
            <Button type="submit">
              <Icon type="check" />
              <span>Add</span>
            </Button>{" "}
            <LinkButton to=".." relative="path">
              <Icon type="x" />
              <span>Cancel</span>
            </LinkButton>
          </FormItem>
        </fieldset>
      </Form>
    </Main>
  );
}

export function ErrorBoundary() {
  return <GeneralErrorBoundary />;
}
