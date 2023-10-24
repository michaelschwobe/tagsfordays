import { conform, useForm } from "@conform-to/react";
import { parse } from "@conform-to/zod";
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { useId } from "react";
import { ButtonCancel } from "~/components/button-cancel";
import { ButtonDelete } from "~/components/button-delete";
import { GeneralErrorBoundary, MainError } from "~/components/error-boundary";
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
import { LinkButton } from "~/components/ui/link-button";
import {
  deleteTag,
  getTag,
  getTagByName,
  updateTag,
} from "~/models/tag.server";
import { requireUserId } from "~/utils/auth.server";
import {
  formatMetaTitle,
  getFieldError,
  invariant,
  invariantResponse,
} from "~/utils/misc";
import { toUpdateTagFormSchema } from "~/utils/tag-validation";
import { redirectWithToast } from "~/utils/toast.server";

export async function loader({ params, request }: LoaderFunctionArgs) {
  await requireUserId(request);

  invariant(params["tagId"], "tagId not found");
  const { tagId: id } = params;

  const tag = await getTag({ id });

  invariantResponse(tag, "Not Found", { status: 404 });

  return json({ tag });
}

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const userId = await requireUserId(request);

  invariant(params["tagId"], "tagId not found");
  const { tagId: id } = params;

  const formData = await request.formData();
  const intent = formData.get(conform.INTENT);

  if (intent === "delete") {
    await deleteTag({ id, userId });
    return redirectWithToast("/tags", {
      type: "success",
      description: "Tag deleted.",
    });
  }

  const submission = await parse(formData, {
    async: true,
    schema: (intent) =>
      toUpdateTagFormSchema(intent, {
        async isTagNameUnique(name) {
          const result = await getTagByName({ name });
          return result === null || result.id === id;
        },
      }),
  });

  if (!submission.value || submission.intent !== "submit") {
    return json(submission);
  }

  const tag = await updateTag({ id, name: submission.value.name, userId });

  return redirect(`/tags/${tag.id}`);
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data?.tag.name) {
    return [{ title: "404: Tag Not Found" }];
  }

  return [{ title: formatMetaTitle("Editing Tag…") }];
};

export default function EditTagPage() {
  const actionData = useActionData<typeof action>();
  const loaderData = useLoaderData<typeof loader>();
  const navigation = useNavigation();

  const id = useId();
  const [form, fields] = useForm({
    id,
    defaultValue: {
      id: loaderData.tag.id,
      name: loaderData.tag.name,
    },
    lastSubmission: actionData!, // Lie! exactOptionalPropertyTypes mismatch
    onValidate({ formData }) {
      return parse(formData, {
        schema: (intent) => toUpdateTagFormSchema(intent),
      });
    },
    shouldRevalidate: "onBlur",
  });

  const isPending = navigation.state !== "idle";

  return (
    <Main>
      <div className="mb-4 flex items-center gap-2">
        <H1>
          <Icon type="tag" />
          Edit Tag
        </H1>
        <ButtonCancel />
      </div>

      <Form className="flex flex-col gap-4" method="POST" {...form.props}>
        <FormMessage id={form.errorId}>{form.error}</FormMessage>

        <input
          type="hidden"
          name={fields.id.name}
          value={fields.id.defaultValue}
        />

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
            Original: <Code>{loaderData.tag.name}</Code>
          </FormDescription>
          <FormMessage id={fields.name.errorId}>
            {getFieldError(fields.name)}
          </FormMessage>
        </FormItem>
      </Form>

      {/**
       * Button group moved outside of <form>
       * to prevent nested "delete" <form>
       */}
      <FormItem className="pt-6" isButtonGroup>
        <Button
          type="submit"
          disabled={isPending}
          form={form.id}
          className="max-sm:w-full"
          variant="filled"
          size="lg"
        >
          <Icon type="check" />
          <span>Update tag</span>
        </Button>{" "}
        <ButtonDelete singular="tag" className="max-sm:w-full" size="lg" />
      </FormItem>
    </Main>
  );
}

export function ErrorBoundary() {
  return (
    <GeneralErrorBoundary
      statusHandlers={{
        404: () => (
          <MainError>
            <p className="mb-4">Tag not found.</p>
            <div>
              <LinkButton to="/tags">
                <Icon type="tags" />
                <span>View all tags</span>
              </LinkButton>
            </div>
          </MainError>
        ),
      }}
    />
  );
}
