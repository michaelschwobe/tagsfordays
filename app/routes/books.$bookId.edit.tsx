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
import { ButtonDelete } from "~/components/button-delete";
import { GeneralErrorBoundary, MainError } from "~/components/error-boundary";
import { Main } from "~/components/main";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { FormControl } from "~/components/ui/form-control";
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
  deleteBook,
  favoriteBook,
  getBook,
  getBookByTitle,
  updateBook,
} from "~/models/book.server";
import { getBookmarks } from "~/models/bookmark.server";
import { getTags } from "~/models/tag.server";
import { requireUserId } from "~/utils/auth.server";
import {
  FavoriteBookFormSchema,
  toUpdateBookFormSchema,
} from "~/utils/book-validation";
import {
  formatMetaTitle,
  getFieldError,
  invariant,
  invariantResponse,
} from "~/utils/misc";
import { redirectWithToast } from "~/utils/toast.server";

export async function loader({ params, request }: LoaderFunctionArgs) {
  await requireUserId(request);

  invariant(params["bookId"], "bookId not found");
  const { bookId } = params;

  const book = await getBook({ id: bookId });
  invariantResponse(book, "Not Found", { status: 404 });

  const [bookmarks, tags] = await Promise.all([getBookmarks(), getTags()]);

  return json({ book, bookmarks, tags });
}

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const userId = await requireUserId(request);

  invariant(params["bookId"], "bookId not found");
  const { bookId } = params;

  const formData = await request.formData();
  const intent = formData.get(conform.INTENT);

  if (intent === "favorite") {
    const formFields = Object.fromEntries(formData.entries());
    const submission = FavoriteBookFormSchema.safeParse(formFields);
    if (submission.success) {
      const { favorite = null } = submission.data;
      await favoriteBook({ id: bookId, favorite, userId });
    }
  }

  if (intent === "delete") {
    await deleteBook({ id: bookId, userId });
    return redirectWithToast("/books", {
      type: "success",
      description: "Book deleted.",
    });
  }

  const submission = await parse(formData, {
    async: true,
    schema: (intent) =>
      toUpdateBookFormSchema(intent, {
        async isBookTitleUnique(title) {
          const result = await getBookByTitle({ title });
          return result === null || result.id === bookId;
        },
      }),
  });

  if (!submission.value || submission.intent !== "submit") {
    return json(submission);
  }

  const book = await updateBook({
    id: bookId,
    title: submission.value.title,
    content: submission.value.content ?? null,
    favorite: submission.value.favorite ?? null,
    bookmarks: submission.value.bookmarks ?? [],
    tags: submission.value.tags ?? [],
    userId,
  });

  return redirect(`/books/${book.id}`);
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data?.book.title) {
    return [{ title: "404: Book Not Found" }];
  }

  return [{ title: formatMetaTitle("Editing Book…") }];
};

export default function EditBookPage() {
  const actionData = useActionData<typeof action>();
  const loaderData = useLoaderData<typeof loader>();
  const navigation = useNavigation();

  const id = useId();
  const [form, fields] = useForm({
    id,
    defaultValue: {
      id: loaderData.book.id,
      title: loaderData.book.title,
      content: loaderData.book.content,
      favorite: loaderData.book.favorite === true ? "on" : undefined,
      bookmarks: loaderData.book.bookmarks.map((el) => el.bookmark.url),
      tags: loaderData.book.tags.map((el) => el.tag.name),
    },
    lastSubmission: actionData!, // Lie! exactOptionalPropertyTypes mismatch
    onValidate({ formData }) {
      return parse(formData, {
        schema: (intent) => toUpdateBookFormSchema(intent),
      });
    },
    shouldRevalidate: "onBlur",
  });

  const bookmarksList = useFieldList(form.ref, fields.bookmarks);

  const bookmarksSelected = bookmarksList
    .filter((t) => t.defaultValue != null)
    .map((t) => ({ ...t, defaultValue: t.defaultValue ?? "" }));

  const bookmarksNotSelected = loaderData.bookmarks
    .filter(
      (t) => !bookmarksSelected.map((s) => s.defaultValue).includes(t.url),
    )
    .map((t) => ({ ...t, defaultValue: t.url ?? "" }));

  const bookmarksAll = [...bookmarksSelected, ...bookmarksNotSelected].sort(
    (a, b) => {
      const a1 = a.defaultValue.toLowerCase();
      const b1 = b.defaultValue.toLowerCase();
      return a1 < b1 ? -1 : a1 > b1 ? 1 : 0;
    },
  );

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
          <Icon type="book" />
          Edit Book
        </H1>
        <ButtonCancel />
      </div>

      <Form {...form.props} method="POST" className="space-y-4 sm:space-y-8">
        <FormMessage id={form.errorId}>{form.error}</FormMessage>

        <input
          type="hidden"
          name={fields.id.name}
          value={fields.id.defaultValue}
          hidden
        />

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
            Bookmarks <Badge aria-hidden>{bookmarksSelected.length}</Badge>
          </legend>
          <FormControl className="grid sm:grid-cols-4">
            {bookmarksAll.map((bookmark) =>
              "key" in bookmark ? (
                <div key={bookmark.key}>
                  <input
                    type="hidden"
                    name={bookmark.name}
                    value={bookmark.defaultValue}
                    hidden
                  />
                  <Button
                    {...list.remove(fields.bookmarks.name, {
                      index: bookmarksSelected.findIndex(
                        (t) => t.defaultValue === bookmark.defaultValue,
                      ),
                    })}
                    type="submit"
                    disabled={isPending}
                    className="w-full justify-between"
                    size="sm"
                    variant="filled"
                  >
                    <span className="sr-only">Remove</span>{" "}
                    <span className="truncate">{bookmark.defaultValue}</span>
                    <Icon type="x" />
                  </Button>
                </div>
              ) : (
                <div key={bookmark.url}>
                  <Button
                    {...list.insert(fields.bookmarks.name, {
                      defaultValue: bookmark.url,
                    })}
                    type="submit"
                    disabled={isPending}
                    className="w-full justify-start"
                    size="sm"
                  >
                    <Icon type="plus" />
                    <span className="sr-only">Add</span>{" "}
                    <span className="truncate">{bookmark.url}</span>
                  </Button>
                </div>
              ),
            )}
          </FormControl>
          <FormMessage id={fields.bookmarks.errorId}>
            {getFieldError(fields.bookmarks)}
          </FormMessage>
        </fieldset>

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
          <span>Update book</span>
        </Button>{" "}
        <ButtonDelete
          formAction={`/books/${loaderData.book.id}/edit`}
          label="book"
          size="lg"
          className="max-sm:w-full"
        />
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
            <p>Book not found.</p>
            <div>
              <LinkButton to="/books">
                <Icon type="books" />
                <span>View all books</span>
              </LinkButton>
            </div>
          </MainError>
        ),
      }}
    />
  );
}
