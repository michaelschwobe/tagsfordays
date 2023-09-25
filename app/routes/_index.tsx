import type { MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { LatestBookmarks } from "~/components/latest-bookmarks";
import { LatestTags } from "~/components/latest-tags";
import { Main } from "~/components/main";
import { QuickBookmark } from "~/components/quick-bookmark";
import { QuickTag } from "~/components/quick-tag";
import { getLatestBookmarks } from "~/models/bookmark.server";
import { mapBookmarksWithFavicon } from "~/models/favicon.server";
import { getLatestTags } from "~/models/tag.server";
import { generateSocialMeta } from "~/utils/meta";
import {
  APP_DESCRIPTION_LONG,
  APP_DESCRIPTION_SHORT,
  APP_NAME,
} from "~/utils/misc";

export async function loader() {
  const [latestBookmarks, latestTags] = await Promise.all([
    getLatestBookmarks(),
    getLatestTags({ take: 9 }),
  ]);
  const latestBookmarksWithFavicon =
    await mapBookmarksWithFavicon(latestBookmarks);

  return json({ latestBookmarks: latestBookmarksWithFavicon, latestTags });
}

export const meta: MetaFunction<typeof loader> = () => {
  const title = `${APP_NAME} - ${APP_DESCRIPTION_SHORT}`;
  const description = APP_DESCRIPTION_LONG;

  return [
    { title },
    { name: "description", content: description },
    ...generateSocialMeta({ title, description }),
  ];
};

export default function HomePage() {
  const loaderData = useLoaderData<typeof loader>();

  return (
    <Main>
      <div className="grid gap-2 sm:grid-cols-2 sm:gap-8">
        <div className="sr-only">
          <h1>{APP_NAME}</h1>
          <p>{APP_DESCRIPTION_LONG}</p>
        </div>

        <QuickBookmark redirectTo="/" />

        <QuickTag redirectTo="/" />

        <LatestBookmarks data={loaderData.latestBookmarks} />

        <LatestTags data={loaderData.latestTags} />
      </div>
    </Main>
  );
}
