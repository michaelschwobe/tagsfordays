import type { V2_MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { GeneralErrorBoundary } from "~/components/error-boundary";
import { getTagListItems } from "~/models/tag.server";
import {
  formatItemsFoundByCount,
  formatMetaTitle,
  toTitleCase,
} from "~/utils/misc";

export async function loader() {
  const tagListItems = await getTagListItems();
  return json({ tagListItems });
}

export const meta: V2_MetaFunction = () => {
  const title = formatMetaTitle("Tags");
  return [{ title }];
};

export default function TagsIndexPage() {
  const loaderData = useLoaderData<typeof loader>();

  return (
    <main>
      <h1>
        {toTitleCase(
          formatItemsFoundByCount({
            count: loaderData.tagListItems.length,
            single: "tag",
            plural: "tags",
          }),
        )}
      </h1>

      <div>
        <Link to="new">+ Add Tag</Link>
      </div>

      {loaderData.tagListItems.length > 0 ? (
        <ul>
          {loaderData.tagListItems.map((tag) => (
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
