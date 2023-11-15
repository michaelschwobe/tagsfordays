import type { MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { CardLatestBookmarks } from "~/components/card-latest-bookmarks";
import { CardLatestTags } from "~/components/card-latest-tags";
import { CardQuickBookmark } from "~/components/card-quick-bookmark";
import { CardQuickTag } from "~/components/card-quick-tag";
import { Intro } from "~/components/intro";
import { Main } from "~/components/main";
import { getLatestBookmarks } from "~/models/bookmark.server";
import { mapWithFaviconSrc } from "~/models/favicon.server";
import { getLatestTags } from "~/models/tag.server";
import { generateSocialMeta } from "~/utils/meta";

export async function loader() {
  const [latestBookmarksResults, latestTags] = await Promise.all([
    getLatestBookmarks(),
    getLatestTags({ take: 9 }),
  ]);
  const latestBookmarks = await mapWithFaviconSrc(latestBookmarksResults);

  return json({ latestBookmarks, latestTags });
}

export const meta: MetaFunction<typeof loader> = () => {
  const title = `${ENV.APP_NAME} - ${ENV.APP_DESCRIPTION_SHORT}`;
  const description = ENV.APP_DESCRIPTION_LONG;

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
        <Intro className="sm:col-span-2" />

        <CardQuickBookmark redirectTo="/" />

        <CardQuickTag redirectTo="/" />

        <CardLatestBookmarks data={loaderData.latestBookmarks} />

        <CardLatestTags data={loaderData.latestTags} />
      </div>
    </Main>
  );
}
