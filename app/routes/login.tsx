import type { ActionArgs, LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useSearchParams } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { GeneralErrorBoundary } from "~/components/error-boundary";
import { verifyLogin } from "~/models/user.server";
import { createUserSession, getUserId } from "~/utils/auth.server";
import { HOME_ROUTE, formatMetaTitle, safeRedirect } from "~/utils/misc";

// const LoginFormSchema = z.object({
//   username: UsernameSchema,
//   password: PasswordSchema,
//   redirectTo: z.string().optional(),
//   remember: checkboxSchema(),
// });

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await getUserId(request);
  if (userId) {
    return redirect(HOME_ROUTE);
  }
  return json({});
};

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();
  const username = formData.get("username");
  const password = formData.get("password");
  const redirectTo = safeRedirect(formData.get("redirectTo"));
  const remember = formData.get("remember");
  if (typeof username !== "string" || username.length === 0) {
    return json(
      { errors: { username: "Username is invalid", password: null } },
      { status: 400 },
    );
  }
  if (typeof password !== "string" || password.length === 0) {
    return json(
      { errors: { username: null, password: "Password is required" } },
      { status: 400 },
    );
  }
  if (password.length < 8) {
    return json(
      { errors: { username: null, password: "Password is too short" } },
      { status: 400 },
    );
  }
  const user = await verifyLogin(username, password);
  if (!user) {
    return json(
      { errors: { username: "Invalid username or password", password: null } },
      { status: 400 },
    );
  }
  return createUserSession({
    redirectTo,
    remember: remember === "on" ? true : false,
    request,
    userId: user.id,
  });
};

export const meta: V2_MetaFunction = () => {
  const title = formatMetaTitle("Login");
  return [{ title }];
};

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? undefined;
  const actionData = useActionData<typeof action>();
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (actionData?.errors?.username) {
      usernameRef.current?.focus();
    } else if (actionData?.errors?.password) {
      passwordRef.current?.focus();
    }
  }, [actionData]);
  return (
    <main>
      <h1>Login</h1>

      <Form method="post">
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <div>
          <label htmlFor="username-field">Username</label>
          <input
            type="text"
            id="username-field"
            name="username"
            autoComplete="username"
            autoFocus={true}
            aria-invalid={actionData?.errors?.username ? true : undefined}
            aria-errormessage={
              actionData?.errors?.username ? "username-error" : undefined
            }
            ref={usernameRef}
            required
          />
          {actionData?.errors?.username ? (
            <div id="username-error">{actionData.errors.username}</div>
          ) : null}
        </div>

        <div>
          <label htmlFor="password-field">Password</label>
          <input
            type="password"
            id="password-field"
            name="password"
            autoComplete="current-password"
            aria-invalid={actionData?.errors?.password ? true : undefined}
            aria-errormessage={
              actionData?.errors?.password ? "password-error" : undefined
            }
            ref={passwordRef}
          />
          {actionData?.errors?.password ? (
            <div id="password-error">{actionData.errors.password}</div>
          ) : null}
        </div>

        <div>
          <div>
            <input id="remember-field" name="remember" type="checkbox" />
            <label htmlFor="remember-field">Remember me</label>
          </div>
        </div>

        <div>
          <button type="submit">Log in</button>
        </div>
      </Form>
    </main>
  );
}

export function ErrorBoundary() {
  return <GeneralErrorBoundary />;
}
