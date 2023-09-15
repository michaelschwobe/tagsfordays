import {
  isRouteErrorResponse,
  useParams,
  useRouteError,
} from "@remix-run/react";
import type { ErrorResponse } from "@remix-run/router";
import { Main } from "~/components/main";
import { H1 } from "~/components/ui/h1";
import { Icon } from "~/components/ui/icon";
import { getErrorMessage } from "~/utils/misc";

export function MainError({ children }: { children: React.ReactNode }) {
  return (
    <Main>
      <H1 className="mb-4">
        <Icon type="alert-triangle" />
        Error
      </H1>
      {children}
    </Main>
  );
}

export type StatusHandler = (info: {
  error: ErrorResponse;
  params: Record<string, string | undefined>;
}) => JSX.Element | null;

export interface GeneralErrorBoundaryProps {
  defaultStatusHandler?: StatusHandler;
  statusHandlers?: Record<number, StatusHandler>;
  unexpectedErrorHandler?: (error: unknown) => JSX.Element | null;
}

export function GeneralErrorBoundary({
  defaultStatusHandler = ({ error }) => (
    <MainError>
      <p>
        {error.status} {error.data}
      </p>
    </MainError>
  ),
  statusHandlers,
  unexpectedErrorHandler = (error) => (
    <MainError>
      <p>{getErrorMessage(error)}</p>
    </MainError>
  ),
}: GeneralErrorBoundaryProps) {
  const error = useRouteError();
  const params = useParams();

  if (typeof document !== "undefined") {
    console.error(error);
  }

  return (
    <>
      {isRouteErrorResponse(error)
        ? (statusHandlers?.[error.status] ?? defaultStatusHandler)({
            // @ts-expect-error, pretty sure this is a bug in Remix
            error,
            params,
          })
        : unexpectedErrorHandler(error)}
    </>
  );
}
