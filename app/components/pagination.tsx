import { Form } from "@remix-run/react";
import { forwardRef } from "react";
import { Button } from "~/components/ui/button";
import { Icon } from "~/components/ui/icon";
import { cn } from "~/utils/misc";

export function paginateSearchParams({
  defaultPerPage,
  searchParams,
}: {
  /** The default number of items per page. */
  defaultPerPage: number;
  /** The search params. **Required** */
  searchParams: URLSearchParams;
}) {
  const skip = Number(searchParams.get("skip")) || 0;
  const take = Number(searchParams.get("take")) || defaultPerPage;
  const params: Array<[key: string, value: string]> = [
    ...Array.from(searchParams.entries()).filter(
      ([key]) => key !== "skip" && key !== "take",
    ),
    ["take", String(take)],
  ];
  return { params, skip, take };
}

export function paginate({
  pagesMax,
  skip,
  take,
  total,
}: {
  /** The maximum number of pages to show. **Required** */
  pagesMax: number;
  /** The number of items to skip. **Required** */
  skip: number;
  /** The number of items per page. **Required** */
  take: number;
  /** The total number of items. **Required** */
  total: number;
}) {
  const pagesTotal = Math.ceil(total / take);
  const pagesMaxHalved = Math.floor(pagesMax / 2);

  const currPageValue = Math.floor(skip / take) + 1;
  const prevPageValue = Math.max(skip - take, 0);
  const nextPageValue = Math.min(skip + take, total - take + 1);
  const lastPageValue = (pagesTotal - 1) * take;

  const hasPrevPage = skip > 0;
  const hasNextPage = skip + take < total;

  const skipPageNumbers: number[] = [];
  if (pagesTotal <= pagesMax) {
    for (let i = 1; i <= pagesTotal; i++) {
      skipPageNumbers.push(i);
    }
  } else {
    let startPage = currPageValue - pagesMaxHalved;
    let endPage = currPageValue + pagesMaxHalved;
    if (startPage < 1) {
      endPage += Math.abs(startPage) + 1;
      startPage = 1;
    }
    if (endPage > pagesTotal) {
      startPage -= endPage - pagesTotal;
      endPage = pagesTotal;
    }
    for (let i = startPage; i <= endPage; i++) {
      skipPageNumbers.push(i);
    }
  }
  const skipPages = skipPageNumbers.map((skipPageNumber) => {
    const skipPageValue = (skipPageNumber - 1) * take;
    const isCurrPage = skipPageNumber === currPageValue;
    const isSkipPage = skipPageValue >= 0 && skipPageValue < total;
    return { isCurrPage, isSkipPage, skipPageNumber, skipPageValue };
  });

  return {
    prevPageValue,
    currPageValue,
    nextPageValue,
    lastPageValue,
    hasPrevPage,
    hasNextPage,
    skipPages,
  };
}

export interface PaginationProps
  extends React.ComponentPropsWithoutRef<typeof Form> {
  /** Sets the `class` attribute. */
  className?: string | undefined;
  /** The maximum number of pages to show. */
  pagesMax?: Parameters<typeof paginate>[0]["pagesMax"] | undefined;
  /** Sets the hidden fields. **Required** */
  params: ReturnType<typeof paginateSearchParams>["params"];
  /** The number of items to skip. **Required** */
  skip: Parameters<typeof paginate>[0]["skip"];
  /** The number of items per page. **Required** */
  take: Parameters<typeof paginate>[0]["take"];
  /** The total number of items. **Required** */
  total: Parameters<typeof paginate>[0]["total"];
}

export const Pagination = forwardRef<
  React.ElementRef<typeof Form>,
  PaginationProps
>(
  (
    { children, className, pagesMax = 7, params, skip, take, total, ...props },
    forwardedRef,
  ) => {
    const pagination = paginate({ pagesMax, skip, take, total });

    return (
      <Form
        {...props}
        className={cn("flex flex-wrap items-center gap-2", className)}
        method="GET"
        preventScrollReset
        data-testid="pagination-bar"
        ref={forwardedRef}
      >
        {params.map(([key, value]) => (
          <input key={key} type="hidden" name={key} value={value} />
        ))}
        <Button
          type="submit"
          name="skip"
          value="0"
          disabled={!pagination.hasPrevPage}
          variant="outlined"
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
          variant="outlined"
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
            variant={el.isCurrPage ? "ghost" : "outlined"}
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
          variant="outlined"
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
          variant="outlined"
          size="sm-icon"
        >
          <span className="sr-only">Last page</span>
          <Icon type="chevrons-right" />
        </Button>
      </Form>
    );
  },
);

Pagination.displayName = "Pagination";
