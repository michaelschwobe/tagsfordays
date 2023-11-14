import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useLocation } from "@remix-run/react";
import { ButtonDelete } from "~/components/button-delete";
import { GeneralErrorBoundary, MainError } from "~/components/error-boundary";
import { Main } from "~/components/main";
import { Badge } from "~/components/ui/badge";
import { FormControl } from "~/components/ui/form-control";
import { FormItem } from "~/components/ui/form-item";
import { H1 } from "~/components/ui/h1";
import { H2 } from "~/components/ui/h2";
import { Icon } from "~/components/ui/icon";
import { LinkButton } from "~/components/ui/link-button";
import { getTag } from "~/models/tag.server";
import { generateSocialMeta } from "~/utils/meta";
import { formatMetaTitle, invariant, invariantResponse } from "~/utils/misc";
import { USER_LOGIN_ROUTE } from "~/utils/user";

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params["tagId"], "tagId not found");

  const { tagId: id } = params;

  const tag = await getTag({ id });

  invariantResponse(tag, "Not Found", { status: 404 });

  return json({ tag });
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data?.tag.name) {
    return [{ title: "404: Tag Not Found" }];
  }

  const title = formatMetaTitle(data.tag.name);
  const description = `View and edit tag '${data.tag.name}'.`;

  return [
    { title },
    { name: "description", content: description },
    ...generateSocialMeta({ title, description }),
  ];
};

export default function TagDetailPage() {
  const loaderData = useLoaderData<typeof loader>();
  const location = useLocation();

  return (
    <Main>
      <div className="flex items-center gap-2">
        <H1>
          <Icon type="tag" />
          Tag
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

      <div className="flex flex-col gap-4">
        <FormItem>
          <div className="text-sm font-medium">Name</div>
          <FormControl className="py-2">
            <H2>{loaderData.tag.name}</H2>
          </FormControl>
        </FormItem>

        <FormItem>
          <div className="text-sm font-medium">Relations</div>
          <div>
            <LinkButton
              to={`/bookmarks?searchValue=${loaderData.tag.name}&searchKey=tags`}
            >
              <Icon type="bookmarks" />
              <span>Bookmarks</span>
              <Badge aria-hidden>{loaderData.tag._count.bookmarks}</Badge>
            </LinkButton>
          </div>
        </FormItem>

        <FormItem isButtonGroup>
          <LinkButton
            to={`${USER_LOGIN_ROUTE}?redirectTo=${location.pathname}/edit`}
            className="max-sm:w-full"
            size="lg"
            variant="filled"
          >
            <Icon type="pencil" />
            <span>Edit tag</span>
          </LinkButton>{" "}
          <LinkButton
            to={`${USER_LOGIN_ROUTE}?redirectTo=${location.pathname}/split`}
            className="max-sm:w-full"
            size="lg"
          >
            <Icon type="split" />
            <span>Split tag</span>
          </LinkButton>{" "}
          <LinkButton
            to={`${USER_LOGIN_ROUTE}?redirectTo=${location.pathname}/merge`}
            className="max-sm:w-full"
            size="lg"
          >
            <Icon type="merge" />
            <span>Merge tag</span>
          </LinkButton>{" "}
          <ButtonDelete
            formAction={`/tags/${loaderData.tag.id}/edit`}
            label="tag"
            size="lg"
            className="max-sm:w-full"
          />
        </FormItem>
      </div>
    </Main>
  );
}

export function ErrorBoundary() {
  return (
    <GeneralErrorBoundary
      statusHandlers={{
        404: () => (
          <MainError>
            <p>Tag not found.</p>
            <div>
              <LinkButton to="/tags">
                <Icon type="tags" />
                <span>View all tags</span>
              </LinkButton>
            </div>
          </MainError>
        ),
      }}
    />
  );
}
