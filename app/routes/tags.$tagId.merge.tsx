import { useForm } from "@conform-to/react";
import { parse } from "@conform-to/zod";
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { useId } from "react";
import { ButtonCancel } from "~/components/button-cancel";
import { GeneralErrorBoundary, MainError } from "~/components/error-boundary";
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
import { SelectItem, SimpleSelect } from "~/components/ui/select";
import { getTag, getTagByName, getTags, mergeTag } from "~/models/tag.server";
import { requireUserId } from "~/utils/auth.server";
import {
  formatMetaTitle,
  getFieldError,
  invariant,
  invariantResponse,
} from "~/utils/misc";
import { MergeTagFormSchema } from "~/utils/tag-validation";
import { redirectWithToast } from "~/utils/toast.server";

export async function loader({ params, request }: LoaderFunctionArgs) {
  await requireUserId(request);

  invariant(params["tagId"], "tagId not found");
  const { tagId: id } = params;

  const sourceTag = await getTag({ id });
  invariantResponse(sourceTag, "Source Tag Not Found", { status: 404 });

  const tags = await getTags();
  const targetTags = tags.filter((t) => t.name !== sourceTag.name);
  invariantResponse(targetTags.length > 0, "Target Tags Not Found");

  return json({ sourceTag, targetTags });
}

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const userId = await requireUserId(request);

  invariant(params["tagId"], "tagId not found");
  const { tagId: id } = params;

  const sourceTag = await getTag({ id });
  invariantResponse(sourceTag, "Source Tag Not Found", { status: 404 });

  const formData = await request.formData();

  const submission = parse(formData, { schema: MergeTagFormSchema });

  if (!submission.value || submission.intent !== "submit") {
    return json(submission);
  }

  const targetTag = await getTagByName({ name: submission.value.name });
  invariantResponse(targetTag, "Target Tag Not Found", { status: 404 });

  const mergeTagResults = await mergeTag({
    sourceTagId: sourceTag.id,
    targetTagId: targetTag.id,
    userId,
  });

  return redirectWithToast(`/tags/${targetTag.id}`, {
    type: "success",
    title: "Tag merged:",
    description: `${mergeTagResults.length - 1} relation(s) updated`,
  });
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data?.sourceTag.name) {
    return [{ title: "404: Tag Not Found" }];
  }

  return [{ title: formatMetaTitle("Merging Tag…") }];
};

export default function MergeTagPage() {
  const actionData = useActionData<typeof action>();
  const loaderData = useLoaderData<typeof loader>();
  const navigation = useNavigation();

  const id = useId();
  const [form, fields] = useForm({
    id,
    defaultValue: { name: "" },
    lastSubmission: actionData!, // Lie! exactOptionalPropertyTypes mismatch
    onValidate({ formData }) {
      return parse(formData, { schema: MergeTagFormSchema });
    },
    shouldRevalidate: "onBlur",
  });

  const isPending = navigation.state !== "idle";

  return (
    <Main>
      <div className="flex items-center gap-2">
        <H1>
          <Icon type="tag" />
          Merge Tag
        </H1>
        <ButtonCancel />
      </div>

      <Form className="flex flex-col gap-4" method="POST" {...form.props}>
        <FormMessage id={form.errorId}>{form.error}</FormMessage>

        <FormItem>
          <FormLabel htmlFor="sourceTag-name">Source</FormLabel>
          <FormControl>
            <Input
              type="text"
              id="sourceTag-name"
              name="sourceTag-name"
              value={loaderData.sourceTag.name}
              aria-describedby="sourceTag-name-description"
              readOnly
              disabled={isPending}
            />
          </FormControl>
          <FormDescription id="sourceTag-name-description">
            Warning: permanently deleted afterwards
          </FormDescription>
        </FormItem>

        <FormItem>
          <FormLabel htmlFor={fields.name.id}>Target</FormLabel>
          <FormControl>
            <SimpleSelect
              id={fields.name.id}
              name={fields.name.name}
              placeholder="Select tag…"
              disabled={isPending}
            >
              {loaderData.targetTags.map((t) => (
                <SelectItem key={t.name} value={t.name}>
                  {t.name}
                </SelectItem>
              ))}
            </SimpleSelect>
          </FormControl>
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
            <Icon type="merge" />
            <span>Merge tag</span>
          </Button>
        </FormItem>
      </Form>
    </Main>
  );
}

export function ErrorBoundary() {
  return (
    <GeneralErrorBoundary
      statusHandlers={{
        400: () => (
          <MainError>
            <p>Merging requires 2 tags, create another tag and try again.</p>
            <div>
              <LinkButton to="/tags">
                <Icon type="tags" />
                <span>View all tags</span>
              </LinkButton>
            </div>
          </MainError>
        ),
        404: () => (
          <MainError>
            <p>Tag not found.</p>
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
