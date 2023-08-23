import type { V2_MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { LatestBookmarks } from "~/components/latest-bookmarks";
import { LatestTags } from "~/components/latest-tags";
import { Main } from "~/components/main";
import { QuickBookmark } from "~/components/quick-bookmark";
import { QuickTag } from "~/components/quick-tag";
import { H1 } from "~/components/ui/h1";
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
      <div className="mb-4 flex flex-wrap items-baseline gap-x-8 gap-y-2">
        <H1>{APP_NAME}</H1>
        <p className="text-lg leading-tight">{APP_DESCRIPTION}</p>
      </div>

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
