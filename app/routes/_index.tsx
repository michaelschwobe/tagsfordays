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
    getLatestTags({ take: 9 }),
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
      <div className="grid gap-2 sm:grid-cols-2 sm:gap-8">
        <div className="sr-only">
          <h1>{APP_NAME}</h1>
          <p>{APP_DESCRIPTION}</p>
        </div>

        <QuickBookmark redirectTo="/" />

        <QuickTag redirectTo="/" />

        <LatestBookmarks data={loaderData.latestBookmarks} />

        <LatestTags data={loaderData.latestTags} />
      </div>
    </Main>
  );
}
