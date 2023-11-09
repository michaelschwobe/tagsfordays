export type InputHiddenEntries = Array<[name: string, value: string]>;

export function getCursorPaginationSearchParams({
  initialLimit,
  searchParams,
}: {
  initialLimit: number;
  searchParams: URLSearchParams;
}) {
  const cursorId = searchParams.get("cursor");
  const limit = Number(searchParams.get("limit")) || initialLimit;
  const skip = cursorId ? 1 : 0; // skip the cursor item if it exists
  const take = limit + 1; // get extra item to check if there's a next page
  return { cursorId, limit, skip, take };
}

export function getCursorPaginationFieldEntries({
  cursor,
  limit,
  searchParams,
}: {
  cursor: string | null;
  limit: number;
  searchParams: URLSearchParams;
}) {
  const nextEntries: InputHiddenEntries = cursor
    ? [
        ["limit", String(limit)],
        ["cursor", cursor],
      ]
    : [["limit", String(limit)]];
  const currEntries: InputHiddenEntries = Array.from(
    searchParams.entries(),
  ).filter(([key]) => key !== "cursor" && key !== "limit");
  const output: InputHiddenEntries = [...nextEntries, ...currEntries];
  return output;
}

export function getOffsetPaginationSearchParams({
  initialLimit,
  searchParams,
}: {
  initialLimit: number;
  searchParams: URLSearchParams;
}) {
  const skip = Number(searchParams.get("skip")) || 0;
  const take = Number(searchParams.get("take")) || initialLimit;
  return { skip, take };
}

export function getOffsetPaginationFieldEntries({
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
