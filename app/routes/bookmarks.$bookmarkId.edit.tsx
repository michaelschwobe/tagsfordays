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
import { useId } from "react";
import { ButtonDelete } from "~/components/button-delete";
import { GeneralErrorBoundary } from "~/components/error-boundary";
import { Main } from "~/components/main";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { FormControl } from "~/components/ui/form-control";
import { FormDescription } from "~/components/ui/form-description";
import { FormItem } from "~/components/ui/form-item";
import { FormLabel } from "~/components/ui/form-label";
import { FormMessage } from "~/components/ui/form-message";
import { H1 } from "~/components/ui/h1";
import { Icon } from "~/components/ui/icon";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { LinkButton } from "~/components/ui/link-button";
import { Textarea } from "~/components/ui/textarea";
import {
  deleteBookmark,
  getBookmark,
  getBookmarkByUrl,
  updateBookmark,
} from "~/models/bookmark.server";
import { getTags } from "~/models/tag.server";
import { requireUserId } from "~/utils/auth.server";
import { toUpdateBookmarkFormSchema } from "~/utils/bookmark-validation";
import {
  formatMetaTitle,
  getFieldError,
  invariant,
  invariantResponse,
} from "~/utils/misc";

export async function loader({ params, request }: LoaderArgs) {
  await requireUserId(request);

  invariant(params["bookmarkId"], "bookmarkId not found");
  const { bookmarkId: id } = params;

  const bookmark = await getBookmark({ id });

  invariantResponse(bookmark, "Not Found", { status: 404 });

  const tags = await getTags();

  return json({ bookmark, tags });
}

export const action = async ({ params, request }: ActionArgs) => {
  const userId = await requireUserId(request);

  invariant(params["bookmarkId"], "bookmarkId not found");
  const { bookmarkId: id } = params;

  const formData = await request.formData();
  const intent = formData.get(conform.INTENT);

  if (intent === "delete") {
    await deleteBookmark({ id, userId });
    return redirect("/bookmarks");
  }

  const submission = await parse(formData, {
    async: true,
    schema: (intent) =>
      toUpdateBookmarkFormSchema(intent, {
        async isBookmarkUrlUnique(url) {
          const result = await getBookmarkByUrl({ url });
          return result === null;
        },
      }),
  });

  if (!submission.value || submission.intent !== "submit") {
    return json(submission);
  }

  const bookmark = await updateBookmark({
    id,
    url: submission.value.url,
    title: submission.value.title ?? null,
    content: submission.value.content ?? null,
    favorite: submission.value.favorite ?? null,
    tags: submission.value.tags ?? [],
    userId,
  });

  return redirect(`/bookmarks/${bookmark.id}`);
};

export const meta: V2_MetaFunction<typeof loader> = ({ data }) => {
  if (!data?.bookmark.url) {
    return [{ title: "404: Bookmark Not Found" }];
  }

  const title = formatMetaTitle("Editing Bookmark…");

  return [{ title }];
};

export default function EditBookmarkPage() {
  const actionData = useActionData<typeof action>();
  const loaderData = useLoaderData<typeof loader>();
  const navigation = useNavigation();

  const id = useId();
  const [form, fields] = useForm({
    id,
    defaultValue: {
      id: loaderData.bookmark.id,
      url: loaderData.bookmark.url,
      title: loaderData.bookmark.title,
      content: loaderData.bookmark.content,
      favorite: loaderData.bookmark.favorite === true ? "on" : undefined,
      tags: loaderData.bookmark.tags.map((el) => el.tag.name),
    },
    lastSubmission: actionData!, // Lie! exactOptionalPropertyTypes mismatch
    onValidate({ formData }) {
      return parse(formData, {
        schema: (intent) => toUpdateBookmarkFormSchema(intent),
      });
    },
    shouldRevalidate: "onBlur",
  });
  const tagsList = useFieldList(form.ref, fields.tags);

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
      <div className="mb-4 flex items-center gap-2">
        <H1>
          <Icon type="bookmark" />
          Edit Bookmark
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

          <input
            type="hidden"
            name={fields.id.name}
            value={fields.id.defaultValue}
          />

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
              />
            </FormControl>
            <FormDescription id={fields.url.descriptionId}>
              Use secure URLs, ex: <code className="text-black">https://</code>
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
                rows={5}
              />
            </FormControl>
            <FormMessage id={fields.content.errorId}>
              {getFieldError(fields.content)}
            </FormMessage>
          </FormItem>

          <fieldset>
            <legend className="mb-2 flex items-center gap-2 text-sm font-medium">
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
                    />
                    <Button
                      className="max-w-[11rem]"
                      size="sm"
                      variant="filled"
                      {...list.remove(fields.tags.name, {
                        index: tagsSelected.findIndex(
                          (t) => t.defaultValue === tag.defaultValue,
                        ),
                      })}
                    >
                      <span className="sr-only">Remove</span>{" "}
                      <span className="truncate">{tag.defaultValue}</span>
                      <Icon type="x" />
                    </Button>
                  </div>
                ) : (
                  <div key={tag.name}>
                    <Button
                      className="max-w-[11rem]"
                      size="sm"
                      {...list.append(fields.tags.name, {
                        defaultValue: tag.name,
                      })}
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
              />
              <Label htmlFor={fields.favorite.id}>Favorite</Label>
            </FormControl>
            <FormMessage id={fields.favorite.errorId}>
              {getFieldError(fields.favorite)}
            </FormMessage>
          </FormItem>
        </fieldset>
      </Form>

      {/**
       * Button group moved outside of <form>
       * to prevent nested "delete" <form>
       */}
      <FormItem className="pt-6" isButtonGroup>
        <Button
          type="submit"
          disabled={["submitting", "loading"].includes(navigation.state)}
          form={form.id}
          className="max-sm:w-full"
          variant="filled"
          size="lg"
        >
          <Icon type="check" />
          <span>Update bookmark</span>
        </Button>{" "}
        <ButtonDelete singular="bookmark" className="max-sm:w-full" size="lg" />
      </FormItem>
    </Main>
  );
}

export function ErrorBoundary() {
  return (
    <GeneralErrorBoundary
      statusHandlers={{
        404: () => (
          <Main>
            <div className="mb-4 flex items-center gap-2">
              <H1>
                <Icon type="alert-triangle" />
                Error
              </H1>
            </div>

            <p className="mb-4">Bookmark not found.</p>

            <div>
              <LinkButton to="/bookmarks">
                <Icon type="bookmarks" />
                <span>View all bookmarks</span>
              </LinkButton>
            </div>
          </Main>
        ),
      }}
    />
  );
}
