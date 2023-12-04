type InputHiddenEntries = Array<[name: string, value: string]>;

export function toPaginationSearchParams({
  searchParams,
  take,
}: {
  searchParams: URLSearchParams;
  take: number;
}) {
  const nextEntries: InputHiddenEntries = [["take", String(take)]];
  const currEntries: InputHiddenEntries = Array.from(
    searchParams.entries(),
  ).filter(([key]) => key !== "skip" && key !== "take");
  const output: InputHiddenEntries = [...nextEntries, ...currEntries];
  return output;
}

export function toPaginationValues({
  pagesMax,
  skip,
  take,
  total,
}: {
  pagesMax: number;
  skip: number;
  take: number;
  total: number;
}) {
  const pagesTotal = Math.ceil(total / take);
  const pagesMaxHalved = Math.floor(pagesMax / 2);

  const currPageValue = Math.floor(skip / take) + 1;
  const prevPageValue = Math.max(skip - take, 0);
  const nextPageValue = Math.min(skip + take, total - take + 1);
  const lastPageValue = (pagesTotal - 1) * take;

  const skipPageNumbers: number[] = [];
  if (pagesTotal <= pagesMax) {
    for (let i = 1; i <= pagesTotal; i += 1) {
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
    for (let i = startPage; i <= endPage; i += 1) {
      skipPageNumbers.push(i);
    }
  }
  const skipPages = skipPageNumbers.map((number) => {
    const value = (number - 1) * take;
    const isCurrPage = number === currPageValue;
    const isSkipPage = value >= 0 && value < total;
    return { isCurrPage, isSkipPage, number, value };
  });

  const hasPrevPage = skip > 0;
  const hasNextPage = skip + take < total;

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
