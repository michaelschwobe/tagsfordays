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
import invariant from "tiny-invariant";
import { ButtonDelete } from "~/components/button-delete";
import { GeneralErrorBoundary } from "~/components/error-boundary";
import { Main } from "~/components/main";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { FormDescription } from "~/components/ui/form-description";
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
import { UpdateBookmarkFormSchema } from "~/utils/bookmark-validation";
import { formatMetaTitle } from "~/utils/misc";

export async function loader({ params, request }: LoaderArgs) {
  await requireUserId(request);

  invariant(params["bookmarkId"], "bookmarkId not found");
  const { bookmarkId: id } = params;

  const bookmark = await getBookmark({ id });

  if (!bookmark) {
    throw new Response("Not Found", { status: 404 });
  }

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

  const submission = parse(formData, { schema: UpdateBookmarkFormSchema });

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

  if (bookmarkWithSameUrl && bookmarkWithSameUrl.id !== id) {
    const error = { ...submission.error, "": ["URL already exists"] };
    return json({ ...submission, error }, { status: 400 });
  }

  const bookmark = await updateBookmark({
    id,
    url,
    title,
    description,
    favorite,
    tags,
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

export default function NewBookmarkPage() {
  const actionData = useActionData<typeof action>();
  const loaderData = useLoaderData<typeof loader>();
  const navigation = useNavigation();

  const id = useId();
  const [form, fieldset] = useForm({
    id,
    defaultValue: {
      id: loaderData.bookmark.id,
      url: loaderData.bookmark.url,
      title: loaderData.bookmark.title,
      description: loaderData.bookmark.description,
      favorite: loaderData.bookmark.favorite === true ? "on" : undefined,
      tags: loaderData.bookmark.tags.map((el) => el.tag.name),
    },
    lastSubmission: actionData!, // Lie! exactOptionalPropertyTypes mismatch
    onValidate({ formData }) {
      return parse(formData, { schema: UpdateBookmarkFormSchema });
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
      <div className="mb-4 flex items-center gap-2">
        <H1 className="mr-auto flex items-center gap-2">
          <Icon type="pencil" />
          Edit Bookmark
        </H1>

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
            <H1 className="mb-4 flex items-center gap-2">
              <Icon type="alert-triangle" />
              Error
            </H1>

            <p className="mb-4">Bookmark not found.</p>

            <div>
              <LinkButton to="/bookmarks">
                <Icon type="bookmarks" />
                <span>View all Bookmarks</span>
              </LinkButton>
            </div>
          </Main>
        ),
      }}
    />
  );
}
