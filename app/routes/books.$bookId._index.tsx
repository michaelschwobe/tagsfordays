import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useLocation } from "@remix-run/react";
import { ButtonDelete } from "~/components/button-delete";
import { ButtonFavorite } from "~/components/button-favorite";
import { ButtonShare } from "~/components/button-share";
import { GeneralErrorBoundary, MainError } from "~/components/error-boundary";
import { Main } from "~/components/main";
import { Badge } from "~/components/ui/badge";
import { FormControl } from "~/components/ui/form-control";
import { FormItem } from "~/components/ui/form-item";
import { H1 } from "~/components/ui/h1";
import { H2 } from "~/components/ui/h2";
import { Icon } from "~/components/ui/icon";
import { LinkButton } from "~/components/ui/link-button";
import { getBook } from "~/models/book.server";
import { generateSocialMeta } from "~/utils/meta";
import { formatMetaTitle, invariant, invariantResponse } from "~/utils/misc";
import { USER_LOGIN_ROUTE } from "~/utils/user";

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params["bookId"], "bookId not found");
  const { bookId } = params;

  const book = await getBook({ id: bookId });
  invariantResponse(book, "Not Found", { status: 404 });

  return json({ book });
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data?.book.title) {
    return [{ title: "404: Book Not Found" }];
  }

  const title = formatMetaTitle(data.book.title ?? "Untitled book");
  const description = `View and edit book '${data.book.title}'.`;

  return [
    { title },
    { name: "description", content: description },
    ...generateSocialMeta({ title, description }),
  ];
};

export default function BookDetailPage() {
  const loaderData = useLoaderData<typeof loader>();
  const location = useLocation();

  return (
    <Main>
      <div className="flex items-center gap-2">
        <H1>
          <Icon type="book" />
          Book
        </H1>
        <LinkButton
          to={`${USER_LOGIN_ROUTE}?redirectTo=/books/new`}
          variant="filled"
        >
          <Icon type="plus" />
          <Icon type="book" />
          <span className="sr-only">Add book</span>
        </LinkButton>
      </div>

      <div className="flex flex-col gap-4">
        <FormItem>
          <div className="text-sm font-medium">Title</div>
          <FormControl className="py-2">
            <H2 className="flex items-center gap-3">{loaderData.book.title}</H2>
            <ButtonShare />
          </FormControl>
        </FormItem>

        <FormItem>
          <div className="text-sm font-medium">Content</div>
          <FormControl className="py-2">
            <p className="text-black dark:text-white">
              {loaderData.book.content ? (
                <span>{loaderData.book.content}</span>
              ) : (
                <span aria-label="Undescribed">--</span>
              )}
            </p>
          </FormControl>
        </FormItem>

        <FormItem>
          <div className="mr-auto flex items-center gap-2 text-sm font-medium">
            Bookmarks{" "}
            <Badge aria-hidden>{loaderData.book.bookmarks.length}</Badge>
          </div>
          {loaderData.book.bookmarks.length > 0 ? (
            <ul className="grid gap-2 sm:grid-cols-4">
              {loaderData.book.bookmarks.map(({ bookmark }) => (
                <li key={bookmark.id}>
                  <LinkButton
                    to={`/bookmarks/${bookmark.id}`}
                    className="w-full justify-start"
                    size="sm"
                  >
                    <Icon type="bookmark" />
                    <span className="truncate">{bookmark.url}</span>
                  </LinkButton>
                </li>
              ))}
            </ul>
          ) : (
            <div>
              <LinkButton to="/bookmarks">
                <Icon type="bookmarks" />
                <span>View all Bookmarks</span>
              </LinkButton>
            </div>
          )}
        </FormItem>

        <FormItem>
          <div className="mr-auto flex items-center gap-2 text-sm font-medium">
            Tags <Badge aria-hidden>{loaderData.book.tags.length}</Badge>
          </div>
          {loaderData.book.tags.length > 0 ? (
            <ul className="flex flex-wrap gap-2">
              {loaderData.book.tags.map(({ tag }) => (
                <li key={tag.id}>
                  <LinkButton
                    to={`/tags/${tag.id}`}
                    className="max-w-[11rem]"
                    size="sm"
                  >
                    <Icon type="tag" />
                    <span className="truncate">{tag.name}</span>
                  </LinkButton>
                </li>
              ))}
            </ul>
          ) : (
            <div>
              <LinkButton to="/tags">
                <Icon type="tags" />
                <span>View all Tags</span>
              </LinkButton>
            </div>
          )}
        </FormItem>

        <FormItem>
          <div className="text-sm font-medium">Favorite</div>
          <FormControl>
            <ButtonFavorite
              formAction={`/books/${loaderData.book.id}/edit`}
              isFavorite={Boolean(loaderData.book.favorite)}
              size="sm"
            />
          </FormControl>
        </FormItem>

        <FormItem isButtonGroup>
          <LinkButton
            to={`${USER_LOGIN_ROUTE}?redirectTo=${location.pathname}/edit`}
            className="max-sm:w-full"
            size="lg"
            variant="filled"
          >
            <Icon type="pencil" />
            <span>Edit book</span>
          </LinkButton>{" "}
          <ButtonDelete
            formAction={`/books/${loaderData.book.id}/edit`}
            label="book"
            size="lg"
            className="max-sm:w-full"
          />
        </FormItem>
      </div>
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
