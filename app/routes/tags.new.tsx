import { conform, useForm } from "@conform-to/react";
import { parse } from "@conform-to/zod";
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { useId } from "react";
import { ButtonCancel } from "~/components/button-cancel";
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
import { createTag, getTagsByNames } from "~/models/tag.server";
import { requireUserId } from "~/utils/auth.server";
import {
  formatMetaTitle,
  getFieldError,
  promiseAllSettledUnion,
} from "~/utils/misc";
import { toCreateTagFormSchema } from "~/utils/tag-validation";
import { createToastHeaders, redirectWithToast } from "~/utils/toast.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUserId(request);

  return null;
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const userId = await requireUserId(request);

  const formData = await request.formData();

  const submission = await parse(formData, {
    async: true,
    schema: (intent) =>
      toCreateTagFormSchema(intent, {
        async isTagNameUnique(names) {
          const results = await getTagsByNames({ names: names.split(",") });
          return results.length === 0;
        },
      }),
  });

  if (!submission.value || submission.intent !== "submit") {
    return json(submission);
  }

  const names = submission.value.name.split(",");

  const promises = names.map((name) => createTag({ name, userId }));

  const [fulfilled, rejected] = await promiseAllSettledUnion(promises);

  const namesFulfilled = fulfilled.map((tag) => tag.name);
  const namesRejected = names.filter((name) => !namesFulfilled.includes(name));

  if (rejected.length > 0) {
    const error = { "": [`Tags not added: ${namesRejected.join(", ")}`] };
    const headers = await createToastHeaders({
      type: "error",
      title: "Tags not added:",
      description: namesRejected.join(", "),
    });
    return json({ ...submission, error }, { status: 422, headers });
  }

  const isSinglePromise = promises.length === 1;
  const fulfilledId = fulfilled.at(0)?.id;
  if (isSinglePromise && fulfilledId) {
    return redirect(`/tags/${fulfilledId}`);
  }

  return redirectWithToast("/tags", {
    type: "success",
    title: "Tags added:",
    description: namesFulfilled.join(", "),
  });
};

export const meta: MetaFunction<typeof loader> = () => {
  return [{ title: formatMetaTitle("New Tag") }];
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
    shouldRevalidate: "onBlur",
  });

  const isPending = navigation.state !== "idle";

  return (
    <Main>
      <div className="flex items-center gap-2">
        <H1>
          <Icon type="tag" />
          New Tag
        </H1>
        <ButtonCancel />
      </div>

      <Form {...form.props} method="POST" className="space-y-4 sm:space-y-8">
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
              disabled={isPending}
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
            disabled={isPending}
            className="max-sm:w-full"
            variant="filled"
            size="lg"
          >
            <Icon type="plus" />
            <span>Add tag</span>
          </Button>
        </FormItem>
      </Form>
    </Main>
  );
}

export function ErrorBoundary() {
  return <GeneralErrorBoundary />;
}
