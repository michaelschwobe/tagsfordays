import { conform, useForm } from "@conform-to/react";
import { parse } from "@conform-to/zod";
import type { ActionArgs, LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { GeneralErrorBoundary } from "~/components/error-boundary";
import { verifyLogin } from "~/models/user.server";
import { createUserSession, getUserId } from "~/utils/auth.server";
import { formatMetaTitle, safeRedirect } from "~/utils/misc";
import { LoginUserFormSchema } from "~/utils/user-validation";

export const loader = async ({ request }: LoaderArgs) => {
  const url = new URL(request.url);
  const safeRedirectTo = safeRedirect(url.searchParams.get("redirectTo"));

  const userId = await getUserId(request);

  if (userId) {
    return redirect(safeRedirectTo);
  }

  return json({ redirectTo: safeRedirectTo });
};

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();

  const submission = parse(formData, { schema: LoginUserFormSchema });

  if (!submission.value || submission.intent !== "submit") {
    return json(submission);
  }

  const user = await verifyLogin(
    submission.value.username,
    submission.value.password,
  );

  if (!user) {
    const error = { "": "Invalid username or fieldset.password." };
    const { password: _payloadPassword, ...payload } = submission.payload;
    const { password: _valuePassword, ...value } = submission.value;
    return json({ ...submission, error, payload, value }, { status: 400 });
  }

  return createUserSession({
    request,
    userId: user.id,
    remember: submission.value.remember ?? false,
    redirectTo: safeRedirect(submission.value.redirectTo),
  });
};

export const meta: V2_MetaFunction = () => {
  const title = formatMetaTitle("Login");
  const description = "Login"; // TODO: Add description

  return [{ title }, { name: "description", content: description }];
};

export default function LoginPage() {
  const actionData = useActionData<typeof action>();
  const loaderData = useLoaderData<typeof loader>();
  const navigation = useNavigation();

  const [form, fieldset] = useForm({
    id: "login-user",
    defaultValue: { redirectTo: loaderData.redirectTo },
    lastSubmission: actionData!, // Lie! exactOptionalPropertyTypes mismatch
    onValidate({ formData }) {
      return parse(formData, { schema: LoginUserFormSchema });
    },
  });

  const disabled = ["submitting", "loading"].includes(navigation.state);

  return (
    <main>
      <h1>Login</h1>

      <Form method="post" {...form.props}>
        <fieldset disabled={disabled}>
          {form.error ? <div id={form.errorId}>{form.error}</div> : null}

          <div>
            <label htmlFor={fieldset.username.id}>Username</label>
            <input
              {...conform.input(fieldset.username, {
                type: "text",
                ariaAttributes: true,
              })}
              autoComplete="username"
            />
            {fieldset.username.error ? (
              <div id={fieldset.username.errorId}>
                {fieldset.username.error}
              </div>
            ) : null}
          </div>

          <div>
            <label htmlFor={fieldset.password.id}>Password</label>
            <input
              {...conform.input(fieldset.password, {
                type: "password",
                ariaAttributes: true,
              })}
              autoComplete="current-password"
            />
            {fieldset.password.error ? (
              <div id={fieldset.password.errorId}>
                {fieldset.password.error}
              </div>
            ) : null}
          </div>

          <div>
            <div>
              <input
                {...conform.input(fieldset.remember, {
                  type: "checkbox",
                  ariaAttributes: true,
                })}
              />
              <label htmlFor={fieldset.remember.id}>Remember me</label>
            </div>
          </div>

          <input {...conform.input(fieldset.redirectTo, { type: "hidden" })} />

          <div>
            <button type="submit">Log in</button>
          </div>
        </fieldset>
      </Form>
    </main>
  );
}

export function ErrorBoundary() {
  return <GeneralErrorBoundary />;
}
