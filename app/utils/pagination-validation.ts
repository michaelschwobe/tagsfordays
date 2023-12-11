import * as z from "zod";

export function parsePaginationSearchParams({
  defaultSkip,
  defaultTake,
  searchParams,
}: {
  defaultSkip?: number | undefined;
  defaultTake?: number | undefined;
  searchParams: URLSearchParams;
}) {
  const schema = z.object({
    skip: z.coerce
      .number()
      .int()
      .min(0)
      .catch(defaultSkip ?? 0),
    take: z.coerce
      .number()
      .int()
      .min(1)
      .catch(defaultTake ?? 20),
  });
  const params = Object.fromEntries(searchParams.entries());
  const result = schema.parse(params);
  return {
    skip: result.skip,
    take: result.take,
  };
}
