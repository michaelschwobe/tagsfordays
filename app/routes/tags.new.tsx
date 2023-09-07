import { conform, useForm } from "@conform-to/react";
import { parse } from "@conform-to/zod";
import type { ActionArgs, LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  useActionData,
  useNavigate,
  useNavigation,
} from "@remix-run/react";
import { useId } from "react";
import { GeneralErrorBoundary } from "~/components/error-boundary";
import { Main } from "~/components/main";
import { Button } from "~/components/ui/button";
import { Code } from "~/components/ui/code";
import { FormControl } from "~/components/ui/form-control";
import { FormDescription } from "~/components/ui/form-description";
import { FormItem } from "~/components/ui/form-item";
import { FormLabel } from "~/components/ui/form-label";
import { FormMessage } from "~/components/ui/form-message";
import { H1 } from "~/components/ui/h1";
import { Icon } from "~/components/ui/icon";
import { Input } from "~/components/ui/input";
import { createTag, getTagByName } from "~/models/tag.server";
import { requireUserId } from "~/utils/auth.server";
import {
  formatMetaTitle,
  getFieldError,
  isFulfilled,
  isRejected,
} from "~/utils/misc";
import { toCreateTagFormSchema } from "~/utils/tag-validation";
import { createToastHeaders, redirectWithToast } from "~/utils/toast.server";

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

  const namesFulfilled = tagsFulfilled.map((tag) => tag.name);
  const namesRejected = names.filter((name) => !namesFulfilled.includes(name));

  if (tagsRejected.length > 0) {
    const error = { "": [`Tags not added: ${namesRejected.join(", ")}`] };
    const headers = await createToastHeaders({
      type: "error",
      title: "Tags not added:",
      description: namesRejected.join(", "),
    });
    return json({ ...submission, error }, { status: 422, headers });
  }

  const isSingleTag = names.length === 1;
  const singleTagId = tagsFulfilled.at(0)?.id;
  if (isSingleTag && singleTagId) {
    return redirect(`/tags/${singleTagId}`);
  }

  return redirectWithToast("/tags", {
    type: "success",
    title: "Tags added:",
    description: namesFulfilled.join(", "),
  });
};

export const meta: V2_MetaFunction = () => {
  const title = formatMetaTitle("New Tag");

  return [{ title }];
};

export default function NewTagPage() {
  const actionData = useActionData<typeof action>();
  const navigate = useNavigate();
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
    shouldRevalidate: "onBlur",
  });

  return (
    <Main>
      <div className="mb-4 flex items-center gap-2">
        <H1>
          <Icon type="tag" />
          New Tag
        </H1>
        <Button type="button" onClick={() => navigate(-1)} size="md-icon">
          <Icon type="x" />
          <span className="sr-only">Cancel</span>
        </Button>
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
                autoFocus
              />
            </FormControl>
            <FormDescription id={fields.name.descriptionId}>
              Comma separate names, ex: <Code>t1,t2,t3</Code>
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
