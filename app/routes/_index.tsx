import type { MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { CardLatestBookmarks } from "~/components/card-latest-bookmarks";
import { CardLatestTags } from "~/components/card-latest-tags";
import { CardQuickBookmark } from "~/components/card-quick-bookmark";
import { CardQuickTag } from "~/components/card-quick-tag";
import { Intro } from "~/components/intro";
import { Main } from "~/components/main";
import { getBookmarksLatest } from "~/models/bookmark.server";
import { getTagsLatest } from "~/models/tag.server";
import { getFavicons } from "~/utils/favicon.server";
import { generateSocialMeta } from "~/utils/meta";

export async function loader() {
  const [bookmarksLatestResults, tagsLatest] = await Promise.all([
    getBookmarksLatest(),
    getTagsLatest(),
  ]);
  const bookmarksLatest = await getFavicons(bookmarksLatestResults);

  return json({ bookmarksLatest, tagsLatest });
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
      <div className="grid gap-2 lg:grid-cols-2 lg:gap-8">
        <Intro className="pb-4 pt-2 lg:col-span-2 lg:py-0" />

        <CardQuickBookmark redirectTo="/" />

        <CardQuickTag redirectTo="/" />

        <CardLatestBookmarks data={loaderData.bookmarksLatest} />

        <CardLatestTags data={loaderData.tagsLatest} />
      </div>
    </Main>
  );
}
