import type { LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { GeneralErrorBoundary } from "~/components/error-boundary";
import { Main } from "~/components/main";
import { Badge } from "~/components/ui/badge";
import { H1 } from "~/components/ui/h1";
import { Icon } from "~/components/ui/icon";
import { LinkButton } from "~/components/ui/link-button";
import { getTags, getTagsOrderedByRelations } from "~/models/tag.server";
import { formatMetaTitle } from "~/utils/misc";
import { USER_LOGIN_ROUTE } from "~/utils/user";

export async function loader({ request }: LoaderArgs) {
  const url = new URL(request.url);
  const orderBy = url.searchParams.get("orderBy");

  const tags =
    orderBy === "relations"
      ? await getTagsOrderedByRelations()
      : await getTags();

  return json({ orderBy, tags });
}

export const meta: V2_MetaFunction<typeof loader> = ({ data }) => {
  if (!data?.tags) {
    return [{ title: "404: Tags Not Found" }];
  }

  const title = formatMetaTitle("Tags");
  const description = "Tags"; // TODO: Add better tags description

  return [{ title }, { name: "description", content: description }];
};

export default function TagsIndexPage() {
  const loaderData = useLoaderData<typeof loader>();

  return (
    <Main>
      <div className="mb-4 flex items-center gap-2">
        <H1 className="mr-auto flex items-center gap-2">
          <Icon type="tags" />
          Tags <Badge>{loaderData.tags.length}</Badge>
        </H1>

        <LinkButton to={`${USER_LOGIN_ROUTE}?redirectTo=/tags/new`}>
          <Icon type="plus" />
          <Icon type="tag" />
          <span className="sr-only">Add Tag</span>
        </LinkButton>
      </div>

      {loaderData.tags.length > 1 ? (
        <Form className="mb-4" method="GET">
          <div className="sr-only">Order By:</div>
          <div className="inline-flex h-10 items-center gap-1 rounded-lg bg-black p-1 text-white max-sm:w-full">
            <button
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-md px-3 py-1 font-medium transition-all focus-within:border-blue-600 focus-within:outline focus-within:outline-1 focus-within:outline-blue-600 hover:bg-white/30 aria-[pressed=true]:bg-white aria-[pressed=true]:text-black"
              type={
                loaderData.orderBy === "name" || loaderData.orderBy === null
                  ? "button"
                  : "submit"
              }
              aria-pressed={
                loaderData.orderBy === "name" || loaderData.orderBy === null
              }
            >
              Name
            </button>{" "}
            <button
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-md px-3 py-1 font-medium transition-all focus-within:border-blue-600 focus-within:outline focus-within:outline-1 focus-within:outline-blue-600 hover:bg-white/30 aria-[pressed=true]:bg-white aria-[pressed=true]:text-black"
              type={loaderData.orderBy === "relations" ? "button" : "submit"}
              name="orderBy"
              value="relations"
              aria-pressed={loaderData.orderBy === "relations"}
            >
              Relations
            </button>
          </div>
        </Form>
      ) : null}

      {loaderData.tags.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {loaderData.tags.map((tag) => (
            <li key={tag.id}>
              <LinkButton to={tag.id}>
                <span>{tag.name}</span>
                <span className="text-xs">({tag._count.bookmarks})</span>
              </LinkButton>
            </li>
          ))}
        </ul>
      ) : null}
    </Main>
  );
}

export function ErrorBoundary() {
  return <GeneralErrorBoundary />;
}
