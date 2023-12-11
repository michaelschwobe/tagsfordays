import * as z from "zod";

export function parseSearchFormSearchParams<
  SearchKey extends string,
  SearchKeys extends readonly [SearchKey, ...SearchKey[]],
>({
  defaultSearchKey,
  searchKeys,
  searchParams,
}: {
  defaultSearchKey?: SearchKey | null;
  searchKeys: SearchKeys;
  searchParams: URLSearchParams;
}) {
  const schema = z.object({
    searchKey: z
      .enum(searchKeys)
      .nullable()
      .catch(defaultSearchKey ?? null),
    searchValue: z.string().min(1).max(100).nullable().catch(null),
  });
  const params = Object.fromEntries(searchParams.entries());
  const result = schema.parse(params);
  return {
    searchKey: result.searchKey ?? null,
    searchValue: result.searchValue,
  };
}

export function toSearchFormSchema(searchKeys: Parameters<typeof z.enum>[0]) {
  return z.object({
    searchKey: z.enum(searchKeys, {
      required_error: "Search key is required",
      invalid_type_error: "Search key is invalid",
    }),
    searchValue: z
      .string({ required_error: "Search term is required" })
      .min(2, { message: "Search term is too short" })
      .max(45, { message: "Search term is too long" }),
  });
}
