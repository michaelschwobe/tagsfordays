import type { LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { GeneralErrorBoundary } from "~/components/error-boundary";
import { Main } from "~/components/main";
import { Badge } from "~/components/ui/badge";
import { ButtonGroup, ButtonGroupButton } from "~/components/ui/button-group";
import { H1 } from "~/components/ui/h1";
import { H2 } from "~/components/ui/h2";
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
  const description =
    "Browse and sort all of your tags by 'name' or 'relationship count'.";

  return [{ title }, { name: "description", content: description }];
};

export default function TagsIndexPage() {
  const loaderData = useLoaderData<typeof loader>();

  return (
    <Main>
      <div className="mb-4 flex items-center gap-2">
        <H1>
          <Icon type="tags" />
          Tags <Badge aria-hidden>{loaderData.tags.length}</Badge>
        </H1>
        <LinkButton
          to={`${USER_LOGIN_ROUTE}?redirectTo=/tags/new`}
          variant="filled"
        >
          <Icon type="plus" />
          <Icon type="tag" />
          <span className="sr-only">Add tag</span>
        </LinkButton>
      </div>

      {loaderData.tags.length > 1 ? (
        <Form className="mb-4" method="GET">
          <div className="sr-only">Order By</div>
          <ButtonGroup>
            <ButtonGroupButton
              aria-pressed={
                loaderData.orderBy === "name" || loaderData.orderBy === null
              }
            >
              Name
            </ButtonGroupButton>{" "}
            <ButtonGroupButton
              name="orderBy"
              value="relations"
              aria-pressed={loaderData.orderBy === "relations"}
            >
              Relations
            </ButtonGroupButton>
          </ButtonGroup>
        </Form>
      ) : null}

      {loaderData.tags.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {loaderData.tags.map((tag) => (
            <li key={tag.id}>
              <LinkButton to={tag.id} className="max-w-[11rem]" size="sm">
                <Icon type="tag" />
                <span className="truncate">{tag.name}</span>{" "}
                <Badge>{tag._count.bookmarks}</Badge>
              </LinkButton>
            </li>
          ))}
        </ul>
      ) : (
        <>
          <H2 className="mb-2">No Tags Found</H2>
          <div>
            <LinkButton
              to={`${USER_LOGIN_ROUTE}?redirectTo=/tags/new`}
              variant="link"
            >
              Add tag
            </LinkButton>
          </div>
        </>
      )}
    </Main>
  );
}

export function ErrorBoundary() {
  return <GeneralErrorBoundary />;
}
