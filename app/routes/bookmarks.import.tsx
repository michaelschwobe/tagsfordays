import { conform, useForm } from "@conform-to/react";
import { parse } from "@conform-to/zod";
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { useId } from "react";
import { ButtonCancel } from "~/components/button-cancel";
import { Main } from "~/components/main";
import { Button } from "~/components/ui/button";
import { FormControl } from "~/components/ui/form-control";
import { FormItem } from "~/components/ui/form-item";
import { FormLabel } from "~/components/ui/form-label";
import { FormMessage } from "~/components/ui/form-message";
import { H1 } from "~/components/ui/h1";
import { Icon } from "~/components/ui/icon";
import { Input } from "~/components/ui/input";
import { LinkButton } from "~/components/ui/link-button";
import { importBookmark } from "~/models/bookmark.server";
import { requireUserId } from "~/utils/auth.server";
import { parseBookmarkFiles } from "~/utils/bookmark-imports.server";
import { UploadBookmarkFilesSchema } from "~/utils/bookmark-validation";
import {
  formatMetaTitle,
  getFieldError,
  promiseAllSettledUnion,
} from "~/utils/misc";
import { redirectWithToast } from "~/utils/toast.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUserId(request);

  return null;
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const userId = await requireUserId(request);

  const formData = await request.formData();

  const submission = parse(formData, { schema: UploadBookmarkFilesSchema });

  if (!submission.value || submission.intent !== "submit") {
    return json(submission);
  }

  const bookmarkImports = await parseBookmarkFiles(submission.value.files);

  const promises = bookmarkImports.map((bookmarkImport) =>
    importBookmark({
      url: bookmarkImport.url,
      title: bookmarkImport.title,
      createdAt: bookmarkImport.createdAt,
      userId,
    }),
  );

  const [fulfilled, rejected] = await promiseAllSettledUnion(promises);

  const isSinglePromise = promises.length === 1;
  const fulfilledId = fulfilled.at(0)?.id;
  if (isSinglePromise && fulfilledId) {
    return redirect(`/bookmarks/${fulfilledId}`);
  }

  return redirectWithToast("/bookmarks", {
    type: fulfilled.length === 0 ? "error" : "success",
    title: "Bookmarks imported:",
    description: `${fulfilled.length} fulfilled, ${rejected.length} rejected`,
  });
};

export const meta: MetaFunction<typeof loader> = () => {
  return [{ title: formatMetaTitle("Import Bookmarks") }];
};

export default function BookmarksImportPage() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();

  const id = useId();
  const [form, fields] = useForm({
    id,
    lastSubmission: actionData!, // Lie! exactOptionalPropertyTypes mismatch
    onValidate({ formData }) {
      return parse(formData, { schema: UploadBookmarkFilesSchema });
    },
    shouldValidate: "onSubmit",
    shouldRevalidate: "onInput",
  });

  const isPending = navigation.state !== "idle";

  return (
    <Main>
      <div className="flex items-center gap-2">
        <H1>
          <Icon type="bookmarks" />
          Import Bookmarks
        </H1>
        <ButtonCancel />
      </div>

      <Form
        {...form.props}
        method="POST"
        encType="multipart/form-data"
        className="flex flex-col gap-4"
      >
        <FormMessage id={form.errorId}>{form.error}</FormMessage>

        <div className="flex flex-wrap gap-2 sm:max-w-fit sm:flex-nowrap">
          <FormItem className="grow">
            <FormLabel className="sr-only" htmlFor={fields.files.id}>
              Files
            </FormLabel>
            <FormControl>
              <Input
                {...conform.input(fields.files, { type: "file" })}
                accept="text/html"
                multiple
                disabled={isPending}
              />
            </FormControl>
            <FormMessage id={fields.files.errorId}>
              {getFieldError(fields.files)}
            </FormMessage>
          </FormItem>

          <FormItem className="w-full flex-row sm:w-fit sm:flex-row-reverse">
            <Button
              type="submit"
              disabled={isPending}
              className="max-sm:grow"
              size="md"
              variant="filled"
            >
              <Icon type="upload" />
              <span>Upload</span>
            </Button>
            <LinkButton to="." relative="path" reloadDocument size="md-icon">
              <Icon type="x" />
              <span className="sr-only">Reset</span>
            </LinkButton>
          </FormItem>
        </div>
      </Form>
    </Main>
  );
}
