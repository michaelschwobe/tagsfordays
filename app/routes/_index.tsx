import type { V2_MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { LatestBookmarks } from "~/components/latest-bookmarks";
import { LatestTags } from "~/components/latest-tags";
import { Main } from "~/components/main";
import { QuickBookmark } from "~/components/quick-bookmark";
import { QuickTag } from "~/components/quick-tag";
import { getLatestBookmarks } from "~/models/bookmark.server";
import { getLatestTags } from "~/models/tag.server";
import { APP_DESCRIPTION, APP_DESCRIPTION_SHORT, APP_NAME } from "~/utils/misc";

export async function loader() {
  const [latestBookmarks, latestTags] = await Promise.all([
    getLatestBookmarks(),
    getLatestTags(),
  ]);

  return json({ latestBookmarks, latestTags });
}

export const meta: V2_MetaFunction = () => {
  const title = `${APP_NAME} - ${APP_DESCRIPTION_SHORT}`;
  const description = APP_DESCRIPTION;

  return [{ title }, { name: "description", content: description }];
};

export default function HomePage() {
  const loaderData = useLoaderData<typeof loader>();

  return (
    <Main>
      <h1 className="mb-1 text-xl font-semibold">{APP_NAME}</h1>

      <p className="mb-4">{APP_DESCRIPTION}</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-8">
        <QuickBookmark />

        <QuickTag />

        <LatestBookmarks
          className="rounded-xl border border-black p-6"
          data={loaderData.latestBookmarks}
        />

        <LatestTags
          className="rounded-xl border border-black p-6"
          data={loaderData.latestTags}
        />
      </div>
    </Main>
  );
}
