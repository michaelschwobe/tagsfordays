import { conform, list, useFieldList, useForm } from "@conform-to/react";
import { parse } from "@conform-to/zod";
import type { ActionArgs, LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { Fragment, useId } from "react";
import { GeneralErrorBoundary } from "~/components/error-boundary";
import { Main } from "~/components/main";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { FormDescription } from "~/components/ui/form-description";
import { FormLabel } from "~/components/ui/form-label";
import { FormMessage } from "~/components/ui/form-message";
import { Icon } from "~/components/ui/icon";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { LinkButton } from "~/components/ui/link-button";
import { Textarea } from "~/components/ui/textarea";
import { createBookmark, getBookmarkByUrl } from "~/models/bookmark.server";
import { getTags } from "~/models/tag.server";
import { requireUserId } from "~/utils/auth.server";
import { CreateBookmarkFormSchema } from "~/utils/bookmark-validation";
import { formatMetaTitle } from "~/utils/misc";

export async function loader({ request }: LoaderArgs) {
  await requireUserId(request);

  const tags = await getTags();

  return json({ tags });
}

export const action = async ({ request }: ActionArgs) => {
  const userId = await requireUserId(request);

  const formData = await request.formData();

  const submission = parse(formData, { schema: CreateBookmarkFormSchema });

  if (!submission.value || submission.intent !== "submit") {
    return json(submission);
  }

  const {
    url,
    title = null,
    description = null,
    favorite = null,
    tags = [],
  } = submission.value;

  const bookmarkWithSameUrl = await getBookmarkByUrl({ url });

  if (bookmarkWithSameUrl) {
    const error = { ...submission.error, "": ["URL already exists"] };
    return json({ ...submission, error }, { status: 400 });
  }

  const bookmark = await createBookmark({
    url,
    title,
    description,
    favorite,
    tags,
    userId,
  });

  return redirect(`/bookmarks/${bookmark.id}`);
};

export const meta: V2_MetaFunction = () => {
  const title = formatMetaTitle("New Bookmark");

  return [{ title }];
};

export default function NewBookmarkPage() {
  const actionData = useActionData<typeof action>();
  const loaderData = useLoaderData<typeof loader>();
  const navigation = useNavigation();

  const id = useId();
  const [form, fieldset] = useForm({
    id,
    lastSubmission: actionData!, // Lie! exactOptionalPropertyTypes mismatch
    onValidate({ formData }) {
      return parse(formData, { schema: CreateBookmarkFormSchema });
    },
  });
  const tagsList = useFieldList(form.ref, fieldset.tags);

  const tagsSelected = tagsList
    .filter((t) => t.defaultValue != null)
    .map((t) => ({ ...t, defaultValue: t.defaultValue ?? "" }));

  const tagsNotSelected = loaderData.tags
    .filter((t) => !tagsSelected.map((t) => t.defaultValue).includes(t.name))
    .map((t) => ({ ...t, defaultValue: t.name ?? "" }));

  const tagsAll = [...tagsSelected, ...tagsNotSelected].sort((a, b) => {
    const a1 = a.defaultValue.toLowerCase();
    const b1 = b.defaultValue.toLowerCase();
    return a1 < b1 ? -1 : a1 > b1 ? 1 : 0;
  });

  return (
    <Main>
      <h1 className="mb-4 flex items-center gap-2 text-xl font-semibold">
        <Icon type="plus" />
        New Bookmark
      </h1>

      <Form method="POST" {...form.props}>
        <fieldset
          className="flex flex-col gap-4"
          disabled={["submitting", "loading"].includes(navigation.state)}
        >
          <FormMessage id={form.errorId}>{form.error}</FormMessage>

          <div className="flex flex-col gap-1">
            <FormLabel htmlFor={fieldset.url.id}>URL</FormLabel>
            <div>
              <Input
                className="max-sm:w-full"
                {...conform.input(fieldset.url, {
                  type: "url",
                  description: true,
                })}
                autoComplete="false"
              />
            </div>
            <FormDescription id={fieldset.url.descriptionId}>
              Use secure URLs, ex: <code>https://</code>
            </FormDescription>
            <FormMessage id={fieldset.url.errorId}>
              {fieldset.url.error}
            </FormMessage>
          </div>

          <div className="flex flex-col gap-1">
            <FormLabel htmlFor={fieldset.title.id}>Title</FormLabel>
            <div>
              <Input
                className="max-sm:w-full"
                {...conform.input(fieldset.title, { type: "text" })}
                autoComplete="false"
              />
            </div>
            <FormMessage id={fieldset.title.errorId}>
              {fieldset.title.error}
            </FormMessage>
          </div>

          <div className="flex flex-col gap-1">
            <FormLabel htmlFor={fieldset.description.id}>Description</FormLabel>
            <div>
              <Textarea
                className="max-sm:w-full"
                {...conform.textarea(fieldset.description)}
                autoComplete="false"
                rows={5}
              />
            </div>
            <FormMessage id={fieldset.description.errorId}>
              {fieldset.description.error}
            </FormMessage>
          </div>

          <fieldset>
            <legend className="mb-1 flex items-center gap-2 text-sm font-medium">
              Tags <Badge>{tagsSelected.length}</Badge>
            </legend>
            <div className="flex flex-wrap gap-2">
              {tagsAll.map((tag) =>
                "key" in tag ? (
                  <Fragment key={tag.key}>
                    <input
                      type="hidden"
                      name={tag.name}
                      value={tag.defaultValue}
                    />
                    <Button
                      {...list.remove(fieldset.tags.name, {
                        index: tagsSelected.findIndex(
                          (t) => t.defaultValue === tag.defaultValue,
                        ),
                      })}
                    >
                      <span className="sr-only">Remove</span>{" "}
                      <span>{tag.defaultValue}</span>
                      <Icon type="x" />
                    </Button>
                  </Fragment>
                ) : (
                  <Button
                    key={tag.name}
                    {...list.append(fieldset.tags.name, {
                      defaultValue: tag.name,
                    })}
                  >
                    <Icon type="plus" />
                    <span className="sr-only">Add</span> <span>{tag.name}</span>
                  </Button>
                ),
              )}
            </div>
            <FormMessage id={fieldset.tags.errorId}>
              {fieldset.tags.error}
            </FormMessage>
          </fieldset>

          <div className="flex flex-col gap-1">
            <div className="flex h-10 items-center gap-2">
              <input
                {...conform.input(fieldset.favorite, { type: "checkbox" })}
              />
              <Label htmlFor={fieldset.favorite.id}>Favorite</Label>
            </div>
            <FormMessage id={fieldset.favorite.errorId}>
              {fieldset.favorite.error}
            </FormMessage>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:w-80">
            <Button type="submit">
              <Icon type="check" />
              <span>Add</span>
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
  return <GeneralErrorBoundary />;
}
