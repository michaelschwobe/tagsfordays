import { Form } from "@remix-run/react";
import { forwardRef } from "react";
import { Button } from "~/components/ui/button";
import { Icon } from "~/components/ui/icon";
import { cn } from "~/utils/misc";
import { toOffsetPagination } from "~/utils/pagination";

export interface PaginationFormProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof Form>,
    "method" | "preventScrollReset"
  > {
  /** Sets the content. **Required** */
  children: React.ReactNode;
  /** Sets the `class` attribute. */
  className?: string | undefined;
}

export const PaginationForm = forwardRef<
  React.ElementRef<typeof Form>,
  PaginationFormProps
>(({ children, className, ...props }, forwardedRef) => {
  return (
    <Form
      {...props}
      method="GET"
      className={cn(className)}
      preventScrollReset
      data-testid="pagination-form"
      ref={forwardedRef}
    >
      {children}
    </Form>
  );
});

PaginationForm.displayName = "PaginationForm";

export interface ButtonCursorPaginationProps
  extends Omit<React.ComponentPropsWithoutRef<"button">, "children"> {
  /** Sets the `class` attribute. */
  className?: string | undefined;
}

export const ButtonCursorPagination = forwardRef<
  React.ElementRef<"button">,
  ButtonCursorPaginationProps
>(({ className, ...props }, forwardedRef) => {
  return (
    <Button
      {...props}
      type="submit"
      variant="filled"
      className={cn(className)}
      ref={forwardedRef}
    >
      <Icon type="plus" />
      <span>Load more</span>
    </Button>
  );
});

ButtonCursorPagination.displayName = "ButtonCursorPagination";

export interface ButtonGroupOffsetPaginationProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "children"> {
  /** Sets the `class` attribute. */
  className?: string | undefined;
  /** The maximum number of pages to show. */
  pagesMax?: number | undefined;
  /** The number of items to skip. **Required** */
  skip: number;
  /** The number of items per page. **Required** */
  take: number;
  /** The total number of items. **Required** */
  total: number;
}

export const ButtonGroupOffsetPagination = forwardRef<
  React.ElementRef<"div">,
  ButtonGroupOffsetPaginationProps
>(({ className, pagesMax = 7, skip, take, total, ...props }, forwardedRef) => {
  const pagination = toOffsetPagination({ pagesMax, skip, take, total });

  return (
    <div
      {...props}
      className={cn("flex flex-wrap items-center gap-2", className)}
      ref={forwardedRef}
    >
      <Button
        type="submit"
        name="skip"
        value={0}
        disabled={!pagination.hasPrevPage}
        size="sm-icon"
      >
        <Icon type="chevrons-left" />
        <span className="sr-only">First page</span>
      </Button>
      <Button
        type="submit"
        name="skip"
        value={pagination.prevPageValue}
        disabled={!pagination.hasPrevPage}
        size="sm-icon"
      >
        <Icon type="chevron-left" />
        <span className="sr-only">Previous page</span>
      </Button>
      {pagination.skipPages.map((el) => (
        <Button
          key={el.skipPageNumber}
          type="submit"
          name="skip"
          value={el.skipPageValue}
          disabled={!el.isSkipPage}
          variant={el.isCurrPage ? "ghost" : undefined}
          size="sm"
        >
          <span className="sr-only">Page </span>
          {el.skipPageNumber}
        </Button>
      ))}
      <Button
        type="submit"
        name="skip"
        value={pagination.nextPageValue}
        disabled={!pagination.hasNextPage}
        size="sm-icon"
      >
        <span className="sr-only">Next page</span>
        <Icon type="chevron-right" />
      </Button>
      <Button
        type="submit"
        name="skip"
        value={pagination.lastPageValue}
        disabled={!pagination.hasNextPage}
        size="sm-icon"
      >
        <span className="sr-only">Last page</span>
        <Icon type="chevrons-right" />
      </Button>
    </div>
  );
});

ButtonGroupOffsetPagination.displayName = "ButtonGroupOffsetPagination";
