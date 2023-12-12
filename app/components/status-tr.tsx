import { forwardRef } from "react";
import { ButtonDelete } from "~/components/button-delete";
import { StatusCode } from "~/components/status-code";
import { StatusText } from "~/components/status-text";
import { Icon } from "~/components/ui/icon";
import { LinkButton } from "~/components/ui/link-button";
import { Td, Tr } from "~/components/ui/table";
import { cn } from "~/utils/misc";
import type { GetStatusData } from "~/utils/status.server";

export const StatusTr = forwardRef<
  React.ElementRef<"tr">,
  Omit<React.ComponentPropsWithoutRef<"tr">, "children"> & {
    id: string;
    isOkHidden?: boolean;
    statusCode: GetStatusData["status"] | null;
    statusText: GetStatusData["statusText"] | null;
    url: string;
  }
>(
  (
    { className, id, isOkHidden, url, statusCode, statusText, ...props },
    ref,
  ) => {
    return (
      <Tr
        {...props}
        className={cn(
          isOkHidden &&
            typeof statusCode === "number" &&
            statusCode >= 200 &&
            statusCode <= 299
            ? "hidden"
            : undefined,
          className,
        )}
        ref={ref}
      >
        <Td>
          <LinkButton
            to={`/bookmarks/${id}/edit`}
            size="sm-icon"
            variant="ghost"
          >
            <Icon type="pencil" />
            <span className="sr-only">Edit bookmark</span>
          </LinkButton>
        </Td>
        <Td className="max-sm:px-0">
          <StatusCode>{statusCode}</StatusCode>
        </Td>
        <Td>
          <LinkButton
            to={url}
            target="_blank"
            rel="noopener noreferrer"
            size="sm"
            variant="ghost"
            className="flex w-full max-w-[75vw] justify-start overflow-hidden sm:max-w-[45vw]"
          >
            <Icon type="external-link" />
            <span className="truncate font-normal">{url}</span>
          </LinkButton>
        </Td>
        <Td className="max-sm:px-0">
          <StatusText>{statusText}</StatusText>
        </Td>
        <Td>
          <ButtonDelete
            formAction={`/bookmarks/${id}/edit`}
            label="bookmark"
            size="sm-icon"
            variant="ghost-danger"
          />
        </Td>
      </Tr>
    );
  },
);
StatusTr.displayName = "StatusTr";
