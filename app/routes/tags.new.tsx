import { Prisma } from "@prisma/client";
import type { ActionArgs, LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { GeneralErrorBoundary } from "~/components/error-boundary";
import { createTag } from "~/models/tag.server";
import { requireUserId } from "~/utils/auth.server";
import { formatMetaTitle } from "~/utils/misc";

export async function loader({ request }: LoaderArgs) {
  await requireUserId(request);
  return null;
}

export const action = async ({ request }: ActionArgs) => {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const name = formData.get("name");

  if (typeof name !== "string" || name.length === 0) {
    return json({ errors: { name: "Name is required" } }, { status: 400 });
  }

  try {
    const tag = await createTag({ name, userId });
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

export const meta: V2_MetaFunction = () => {
  const title = formatMetaTitle("New Tag");
  return [{ title }];
};

export default function NewTagPage() {
  const actionData = useActionData<typeof action>();

  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (actionData?.errors?.name) {
      nameRef.current?.focus();
    }
  }, [actionData]);

  return (
    <main>
      <h1>New Tag</h1>

      <Form method="post">
        <div>
          <label htmlFor="name-field">Name</label>
          <input
            ref={nameRef}
            type="text"
            id="name-field"
            name="name"
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
          <button type="submit">Add</button>
        </div>
      </Form>
    </main>
  );
}

export function ErrorBoundary() {
  return <GeneralErrorBoundary />;
}
