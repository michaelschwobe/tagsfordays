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
import { useId } from "react";
import { GeneralErrorBoundary } from "~/components/error-boundary";
import { Main } from "~/components/main";
import { Button } from "~/components/ui/button";
import { FormLabel } from "~/components/ui/form-label";
import { FormMessage } from "~/components/ui/form-message";
import { H1 } from "~/components/ui/h1";
import { Icon } from "~/components/ui/icon";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { LinkButton } from "~/components/ui/link-button";
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
    const error = { "": ["Invalid username or password"] };
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

  const id = useId();
  const [form, fieldset] = useForm({
    id,
    defaultValue: { redirectTo: loaderData.redirectTo },
    lastSubmission: actionData!, // Lie! exactOptionalPropertyTypes mismatch
    onValidate({ formData }) {
      return parse(formData, { schema: LoginUserFormSchema });
    },
  });

  return (
    <Main>
      <H1 className="mb-4 flex items-center gap-2">
        <Icon type="log-in" />
        Login
      </H1>

      <Form method="POST" {...form.props}>
        <fieldset
          className="flex flex-col gap-4"
          disabled={["submitting", "loading"].includes(navigation.state)}
        >
          <FormMessage id={form.errorId}>{form.error}</FormMessage>

          <div className="flex flex-col gap-1">
            <FormLabel htmlFor={fieldset.username.id}>Username</FormLabel>
            <div>
              <Input
                className="max-sm:w-full"
                {...conform.input(fieldset.username, { type: "text" })}
                autoComplete="username"
              />
            </div>
            <FormMessage id={fieldset.username.errorId}>
              {fieldset.username.error}
            </FormMessage>
          </div>

          <div className="flex flex-col gap-1">
            <FormLabel htmlFor={fieldset.password.id}>Password</FormLabel>
            <div>
              <Input
                className="max-sm:w-full"
                {...conform.input(fieldset.password, { type: "password" })}
                autoComplete="current-password"
              />
            </div>
            <FormMessage id={fieldset.password.errorId}>
              {fieldset.password.error}
            </FormMessage>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex h-10 items-center gap-2">
              <input
                {...conform.input(fieldset.remember, { type: "checkbox" })}
              />
              <Label htmlFor={fieldset.remember.id}>Remember me</Label>
            </div>
            <FormMessage id={fieldset.remember.errorId}>
              {fieldset.remember.error}
            </FormMessage>
          </div>

          <input {...conform.input(fieldset.redirectTo, { type: "hidden" })} />

          <div className="grid grid-cols-2 gap-2 sm:w-80">
            <Button type="submit">
              <Icon type="log-in" />
              <span>Log in</span>
            </Button>{" "}
            <LinkButton to={loaderData.redirectTo}>
              <Icon type="x" />
              <span>Cancel</span>
            </LinkButton>
          </div>
        </fieldset>
      </Form>
    </Main>
  );
}

export function ErrorBoundary() {
  return <GeneralErrorBoundary />;
}
