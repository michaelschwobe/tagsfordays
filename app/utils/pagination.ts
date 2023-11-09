export function toOffsetPagination({
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
