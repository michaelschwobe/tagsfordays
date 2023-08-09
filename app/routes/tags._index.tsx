import type { LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";
import { GeneralErrorBoundary } from "~/components/error-boundary";
import { getTags, getTagsOrderedByRelations } from "~/models/tag.server";
import {
  formatItemsFoundByCount,
  formatMetaTitle,
  toTitleCase,
} from "~/utils/misc";

export async function loader({ request }: LoaderArgs) {
  const url = new URL(request.url);
  const orderBy = url.searchParams.get("orderBy");

  const tags =
    orderBy === "relations"
      ? await getTagsOrderedByRelations()
      : await getTags();

  return json({ orderBy, tags });
}

export const meta: V2_MetaFunction = () => {
  const title = formatMetaTitle("Tags");
  const description = "Tags"; // TODO: Add description

  return [{ title }, { name: "description", content: description }];
};

export default function TagsIndexPage() {
  const loaderData = useLoaderData<typeof loader>();

  return (
    <main>
      <h1>
        {toTitleCase(
          formatItemsFoundByCount({
            count: loaderData.tags.length,
            single: "tag",
            plural: "tags",
          }),
        )}
      </h1>

      <div>
        <Link to="new">+ Add Tag</Link>
      </div>

      {loaderData.tags.length > 0 ? (
        <Form method="GET">
          <span>Order By:</span>{" "}
          <button
            type={loaderData.orderBy === "name" ? "button" : "submit"}
            name="orderBy"
            value="name"
            aria-pressed={loaderData.orderBy === "name"}
          >
            Name
          </button>{" "}
          <button
            type={loaderData.orderBy === "relations" ? "button" : "submit"}
            name="orderBy"
            value="relations"
            aria-pressed={loaderData.orderBy === "relations"}
          >
            Relations
          </button>
        </Form>
      ) : null}

      {loaderData.tags.length > 0 ? (
        <ul>
          {loaderData.tags.map((tag) => (
            <li key={tag.id}>
              <Link to={tag.id}>
                {tag.name} ({tag._count.bookmarks})
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </main>
  );
}

export function ErrorBoundary() {
  return <GeneralErrorBoundary />;
}
