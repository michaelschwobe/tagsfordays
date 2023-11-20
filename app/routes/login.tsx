import { conform, useForm } from "@conform-to/react";
import { parse } from "@conform-to/zod";
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { useId } from "react";
import { ButtonCancel } from "~/components/button-cancel";
import { GeneralErrorBoundary } from "~/components/error-boundary";
import { Main } from "~/components/main";
import { Button } from "~/components/ui/button";
import { FormControl } from "~/components/ui/form-control";
import { FormItem } from "~/components/ui/form-item";
import { FormLabel } from "~/components/ui/form-label";
import { FormMessage } from "~/components/ui/form-message";
import { H1 } from "~/components/ui/h1";
import { Icon } from "~/components/ui/icon";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { verifyLogin } from "~/models/user.server";
import { createUserSession, getUserId } from "~/utils/auth.server";
import { generateSocialMeta } from "~/utils/meta";
import { formatMetaTitle, getFieldError, safeRedirect } from "~/utils/misc";
import { LoginUserFormSchema } from "~/utils/user-validation";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const safeRedirectTo = safeRedirect(url.searchParams.get("redirectTo"));

  const userId = await getUserId(request);

  if (userId) {
    return redirect(safeRedirectTo);
  }

  return json({ redirectTo: safeRedirectTo });
};

export const action = async ({ request }: ActionFunctionArgs) => {
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

export const meta: MetaFunction<typeof loader> = () => {
  const title = formatMetaTitle("Login");
  const description = `Welcome to ${ENV.APP_NAME}. Log in to add, edit, or delete bookmarks and tags.`;

  return [
    { title },
    { name: "description", content: description },
    ...generateSocialMeta({ title, description }),
  ];
};

export default function LoginPage() {
  const actionData = useActionData<typeof action>();
  const loaderData = useLoaderData<typeof loader>();
  const navigation = useNavigation();

  const id = useId();
  const [form, fields] = useForm({
    id,
    defaultValue: { redirectTo: loaderData.redirectTo },
    lastSubmission: actionData!, // Lie! exactOptionalPropertyTypes mismatch
    onValidate({ formData }) {
      return parse(formData, { schema: LoginUserFormSchema });
    },
    shouldRevalidate: "onBlur",
  });

  const isPending = navigation.state !== "idle";

  return (
    <Main>
      <div className="flex items-center gap-2">
        <H1>
          <Icon type="user" />
          Login
        </H1>
        <ButtonCancel />
      </div>

      <Form {...form.props} method="POST" className="flex flex-col gap-4">
        <FormMessage id={form.errorId}>{form.error}</FormMessage>

        <FormItem>
          <FormLabel htmlFor={fields.username.id}>Username</FormLabel>
          <FormControl>
            <Input
              {...conform.input(fields.username, { type: "text" })}
              autoComplete="username"
              autoFocus
              disabled={isPending}
            />
          </FormControl>
          <FormMessage id={fields.username.errorId}>
            {getFieldError(fields.username)}
          </FormMessage>
        </FormItem>

        <FormItem>
          <FormLabel htmlFor={fields.password.id}>Password</FormLabel>
          <FormControl>
            <Input
              {...conform.input(fields.password, { type: "password" })}
              autoComplete="password"
              disabled={isPending}
            />
          </FormControl>
          <FormMessage id={fields.password.errorId}>
            {getFieldError(fields.password)}
          </FormMessage>
        </FormItem>

        <FormItem>
          <FormControl>
            <input
              {...conform.input(fields.remember, { type: "checkbox" })}
              disabled={isPending}
            />
            <Label htmlFor={fields.remember.id}>Remember me</Label>
          </FormControl>
          <FormMessage id={fields.remember.errorId}>
            {getFieldError(fields.remember)}
          </FormMessage>
        </FormItem>

        <input {...conform.input(fields.redirectTo, { type: "hidden" })} />

        <FormItem isButtonGroup>
          <Button
            type="submit"
            disabled={isPending}
            className="max-sm:w-full"
            variant="filled"
            size="lg"
          >
            <Icon type="log-in" />
            <span>Log in</span>
          </Button>
        </FormItem>
      </Form>
    </Main>
  );
}

export function ErrorBoundary() {
  return <GeneralErrorBoundary />;
}
