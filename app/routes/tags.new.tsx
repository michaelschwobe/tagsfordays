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
import {
  formatMetaTitle,
  getFieldError,
  isFulfilled,
  isRejected,
} from "~/utils/misc";
import { toCreateTagFormSchema } from "~/utils/tag-validation";

export async function loader({ request }: LoaderArgs) {
  await requireUserId(request);

  return null;
}

export const action = async ({ request }: ActionArgs) => {
  const userId = await requireUserId(request);

  const formData = await request.formData();

  const submission = await parse(formData, {
    async: true,
    schema: (intent) =>
      toCreateTagFormSchema(intent, {
        async isTagNameUnique(names) {
          const tagsByNameResults = await Promise.allSettled(
            names.split(",").map((name) => getTagByName({ name })),
          );
          return tagsByNameResults.every(
            (result) => result.status === "fulfilled" && result.value === null,
          );
        },
      }),
  });

  if (!submission.value || submission.intent !== "submit") {
    return json(submission);
  }

  const names = submission.value.name.split(",");

  const tagsResults = await Promise.allSettled(
    names.map((name) => createTag({ name, userId })),
  );

  const tagsFulfilled = tagsResults
    .filter(isFulfilled)
    .map((result) => result.value);

  const tagsRejected = tagsResults
    .filter(isRejected)
    .map((result) => result.reason);

  if (tagsRejected.length > 0) {
    const error = { "": tagsRejected };
    return json({ ...submission, error }, { status: 422 });
  }

  const isSingleTag = names.length === 1;
  const singleTagId = tagsFulfilled.at(0)?.id;
  if (isSingleTag && singleTagId) {
    return redirect(`/tags/${singleTagId}`);
  }

  // TODO: show success message/toast
  // console.log("🟢", tagsFulfilled.length, "tags added");

  return redirect("/tags");
};

export const meta: V2_MetaFunction = () => {
  const title = formatMetaTitle("New Tag");

  return [{ title }];
};

export default function NewTagPage() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();

  const id = useId();
  const [form, fields] = useForm({
    id,
    lastSubmission: actionData!, // Lie! exactOptionalPropertyTypes mismatch
    onValidate({ formData }) {
      return parse(formData, {
        schema: (intent) => toCreateTagFormSchema(intent),
      });
    },
  });

  return (
    <Main>
      <div className="mb-4 flex items-center gap-2">
        <H1>
          <Icon type="tag" />
          New Tag
        </H1>
        <LinkButton to=".." relative="path" size="md-icon">
          <Icon type="x" />
          <span className="sr-only">Cancel</span>
        </LinkButton>
      </div>

      <Form method="POST" {...form.props}>
        <fieldset
          className="flex flex-col gap-4"
          disabled={["submitting", "loading"].includes(navigation.state)}
        >
          <FormMessage id={form.errorId}>{form.error}</FormMessage>

          <FormItem>
            <FormLabel htmlFor={fields.name.id}>Name</FormLabel>
            <FormControl>
              <Input
                {...conform.input(fields.name, {
                  type: "text",
                  description: true,
                })}
                autoComplete="false"
              />
            </FormControl>
            <FormDescription id={fields.name.descriptionId}>
              Comma separate names, ex:{" "}
              <code className="text-black">t1,t2,t3</code>
            </FormDescription>
            <FormMessage id={fields.name.errorId}>
              {getFieldError(fields.name)}
            </FormMessage>
          </FormItem>

          <FormItem isButtonGroup>
            <Button
              type="submit"
              className="max-sm:w-full"
              variant="filled"
              size="lg"
            >
              <Icon type="plus" />
              <span>Add tag</span>
            </Button>
          </FormItem>
        </fieldset>
      </Form>
    </Main>
  );
}

export function ErrorBoundary() {
  return <GeneralErrorBoundary />;
}
