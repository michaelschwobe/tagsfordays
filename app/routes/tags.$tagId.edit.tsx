import { Prisma } from "@prisma/client";
import type { ActionArgs, LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useLoaderData } from "@remix-run/react";
import { useEffect, useRef } from "react";
import invariant from "tiny-invariant";
import { GeneralErrorBoundary } from "~/components/error-boundary";
import { deleteTag, getTag, updateTag } from "~/models/tag.server";
import { requireUserId } from "~/utils/auth.server";
import { formatMetaTitle } from "~/utils/misc";

export async function loader({ request, params }: LoaderArgs) {
  await requireUserId(request);

  invariant(params["tagId"], "tagId not found");
  const { tagId: id } = params;

  const tag = await getTag({ id });

  if (!tag) {
    throw new Response("Not Found", { status: 404 });
  }

  return json({ tag });
}

export const action = async ({ params, request }: ActionArgs) => {
  const userId = await requireUserId(request);

  invariant(params["tagId"], "tagId not found");
  const { tagId: id } = params;

  const formData = await request.formData();
  const action = formData.get("_action");
  const name = formData.get("name");

  if (action === "DELETE") {
    await deleteTag({ id, userId });
    return redirect("/tags");
  }

  if (typeof name !== "string" || name.length === 0) {
    return json({ errors: { name: "Name is required" } }, { status: 400 });
  }

  try {
    const tag = await updateTag({ id, name, userId });
    return redirect(`/tags/${tag.id}`);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return json(
          { errors: { name: "Name already exists" } },
          { status: 400 },
        );
      }
    }
    throw error;
  }
};

export const meta: V2_MetaFunction<typeof loader> = ({ data }) => {
  const title = formatMetaTitle(
    data?.tag.name ? "Editing Tag…" : "404: Tag Not Found",
  );
  return [{ title }];
};

export default function NewTagPage() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (actionData?.errors?.name) {
      nameRef.current?.focus();
    }
  }, [actionData]);

  return (
    <main>
      <h1>Edit Tag</h1>

      <Form method="post">
        <div>
          <label htmlFor="name-field">Name</label>
          <input
            ref={nameRef}
            type="text"
            id="name-field"
            name="name"
            defaultValue={loaderData.tag.name}
            aria-invalid={actionData?.errors?.name ? true : undefined}
            aria-errormessage={
              actionData?.errors?.name ? "name-error" : undefined
            }
          />
          {actionData?.errors?.name ? (
            <div id="name-error">{actionData.errors.name}</div>
          ) : null}
        </div>

        <div>
          <button type="submit">Update</button>
        </div>
      </Form>

      <Form method="post">
        <button type="submit" name="_action" value="DELETE">
          Delete
        </button>
      </Form>
    </main>
  );
}

export function ErrorBoundary() {
  return (
    <GeneralErrorBoundary
      statusHandlers={{
        404: () => (
          <main>
            <h1>Error</h1>
            <p>
              Tag not found. <Link to="/tags">View all Tags</Link>
            </p>
          </main>
        ),
      }}
    />
  );
}
