import { conform, list, useFieldList, useForm } from "@conform-to/react";
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
import { GeneralErrorBoundary } from "~/components/error-boundary";
import { Main } from "~/components/main";
import { Badge } from "~/components/ui/badge";
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
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { createBookmark, getBookmarkByUrl } from "~/models/bookmark.server";
import { getTags } from "~/models/tag.server";
import { requireUserId } from "~/utils/auth.server";
import { toCreateBookmarkFormSchema } from "~/utils/bookmark-validation";
import { formatMetaTitle, getFieldError } from "~/utils/misc";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUserId(request);

  const tags = await getTags();

  return json({ tags });
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const userId = await requireUserId(request);

  const formData = await request.formData();

  const submission = await parse(formData, {
    async: true,
    schema: (intent) =>
      toCreateBookmarkFormSchema(intent, {
        async isBookmarkUrlUnique(url) {
          const result = await getBookmarkByUrl({ url });
          return result === null;
        },
      }),
  });

  if (!submission.value || submission.intent !== "submit") {
    return json(submission);
  }

  const bookmark = await createBookmark({
    url: submission.value.url,
    title: submission.value.title ?? null,
    content: submission.value.content ?? null,
    favorite: submission.value.favorite ?? null,
    tags: submission.value.tags ?? [],
    userId,
  });

  return redirect(`/bookmarks/${bookmark.id}`);
};

export const meta: MetaFunction<typeof loader> = () => {
  return [{ title: formatMetaTitle("New Bookmark") }];
};

export default function NewBookmarkPage() {
  const actionData = useActionData<typeof action>();
  const loaderData = useLoaderData<typeof loader>();
  const navigation = useNavigation();

  const id = useId();
  const [form, fields] = useForm({
    id,
    lastSubmission: actionData!, // Lie! exactOptionalPropertyTypes mismatch
    onValidate({ formData }) {
      return parse(formData, {
        schema: (intent) => toCreateBookmarkFormSchema(intent),
      });
    },
    shouldRevalidate: "onBlur",
  });
  const tagsList = useFieldList(form.ref, fields.tags);

  const tagsSelected = tagsList
    .filter((t) => t.defaultValue != null)
    .map((t) => ({ ...t, defaultValue: t.defaultValue ?? "" }));

  const tagsNotSelected = loaderData.tags
    .filter((t) => !tagsSelected.map((s) => s.defaultValue).includes(t.name))
    .map((t) => ({ ...t, defaultValue: t.name ?? "" }));

  const tagsAll = [...tagsSelected, ...tagsNotSelected].sort((a, b) => {
    const a1 = a.defaultValue.toLowerCase();
    const b1 = b.defaultValue.toLowerCase();
    return a1 < b1 ? -1 : a1 > b1 ? 1 : 0;
  });

  const isPending = navigation.state !== "idle";

  return (
    <Main>
      <div className="flex items-center gap-2">
        <H1>
          <Icon type="bookmark" />
          New Bookmark
        </H1>
        <ButtonCancel />
      </div>

      <Form {...form.props} method="POST" className="space-y-4 sm:space-y-8">
        <FormMessage id={form.errorId}>{form.error}</FormMessage>

        <FormItem>
          <FormLabel htmlFor={fields.url.id}>URL</FormLabel>
          <FormControl>
            <Input
              {...conform.input(fields.url, {
                type: "url",
                description: true,
              })}
              autoComplete="false"
              autoFocus
              disabled={isPending}
            />
          </FormControl>
          <FormDescription id={fields.url.descriptionId}>
            Use secure URLs, ex: <Code>https://</Code>
          </FormDescription>
          <FormMessage id={fields.url.errorId}>
            {getFieldError(fields.url)}
          </FormMessage>
        </FormItem>

        <FormItem>
          <FormLabel htmlFor={fields.title.id}>Title</FormLabel>
          <FormControl>
            <Input
              {...conform.input(fields.title, { type: "text" })}
              autoComplete="false"
              disabled={isPending}
            />
          </FormControl>
          <FormMessage id={fields.title.errorId}>
            {getFieldError(fields.title)}
          </FormMessage>
        </FormItem>

        <FormItem>
          <FormLabel htmlFor={fields.content.id}>Content</FormLabel>
          <FormControl>
            <Textarea
              {...conform.textarea(fields.content)}
              autoComplete="false"
              disabled={isPending}
              rows={5}
            />
          </FormControl>
          <FormMessage id={fields.content.errorId}>
            {getFieldError(fields.content)}
          </FormMessage>
        </FormItem>

        <fieldset className="space-y-2">
          <legend className="flex items-center gap-2 text-sm font-medium">
            Tags <Badge aria-hidden>{tagsSelected.length}</Badge>
          </legend>
          <FormControl className="flex-wrap">
            {tagsAll.map((tag) =>
              "key" in tag ? (
                <div key={tag.key}>
                  <input
                    type="hidden"
                    name={tag.name}
                    value={tag.defaultValue}
                    hidden
                  />
                  <Button
                    {...list.remove(fields.tags.name, {
                      index: tagsSelected.findIndex(
                        (t) => t.defaultValue === tag.defaultValue,
                      ),
                    })}
                    type="submit"
                    disabled={isPending}
                    className="max-w-[11rem]"
                    size="sm"
                    variant="filled"
                  >
                    <span className="sr-only">Remove</span>{" "}
                    <span className="truncate">{tag.defaultValue}</span>
                    <Icon type="x" />
                  </Button>
                </div>
              ) : (
                <div key={tag.name}>
                  <Button
                    {...list.insert(fields.tags.name, {
                      defaultValue: tag.name,
                    })}
                    type="submit"
                    disabled={isPending}
                    className="max-w-[11rem]"
                    size="sm"
                  >
                    <Icon type="plus" />
                    <span className="sr-only">Add</span>{" "}
                    <span className="truncate">{tag.name}</span>
                  </Button>
                </div>
              ),
            )}
          </FormControl>
          <FormMessage id={fields.tags.errorId}>
            {getFieldError(fields.tags)}
          </FormMessage>
        </fieldset>

        <FormItem>
          <FormControl>
            <input
              {...conform.input(fields.favorite, { type: "checkbox" })}
              disabled={isPending}
            />
            <Label htmlFor={fields.favorite.id}>Favorite</Label>
          </FormControl>
          <FormMessage id={fields.favorite.errorId}>
            {getFieldError(fields.favorite)}
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
            <span>Add bookmark</span>
          </Button>
        </FormItem>
      </Form>
    </Main>
  );
}

export function ErrorBoundary() {
  return <GeneralErrorBoundary />;
}
