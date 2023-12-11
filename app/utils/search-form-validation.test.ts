import { parseSearchFormSearchParams } from "./search-form-validation";

describe("parseSearchFormSearchParams", () => {
  test("returns searchKey as string when given a valid bookark key", () => {
    const searchKeys = ["a", "b", "c"] as const;
    const searchParams = new URLSearchParams({ searchKey: "b" });
    const result = parseSearchFormSearchParams({ searchKeys, searchParams });
    expect(result.searchKey).toEqual("b");
  });

  test("returns searchKey as null when given an invalid bookark key", () => {
    const searchKeys = ["a", "b", "c"] as const;
    const searchParams = new URLSearchParams({ searchKey: "badkey" });
    const result = parseSearchFormSearchParams({ searchKeys, searchParams });
    expect(result.searchKey).toBeNull();
  });

  test("returns searchKey as null when an undefined key", () => {
    const searchKeys = ["a", "b", "c"] as const;
    const searchParams = new URLSearchParams();
    const result = parseSearchFormSearchParams({ searchKeys, searchParams });
    expect(result.searchKey).toBeNull();
  });

  test("returns searchValue as string when given a string of length", () => {
    const searchKeys = ["a", "b", "c"] as const;
    const searchParams = new URLSearchParams({ searchValue: "somevalue" });
    const result = parseSearchFormSearchParams({ searchKeys, searchParams });
    expect(result.searchValue).toEqual("somevalue");
  });

  test("returns searchValue as null when not given a string of length", () => {
    const searchKeys = ["a", "b", "c"] as const;
    const searchParams = new URLSearchParams({ searchValue: "" });
    const result = parseSearchFormSearchParams({ searchKeys, searchParams });
    expect(result.searchValue).toBeNull();
  });

  test("returns searchValue as null when given an undefined key", () => {
    const searchKeys = ["a", "b", "c"] as const;
    const searchParams = new URLSearchParams();
    const result = parseSearchFormSearchParams({ searchKeys, searchParams });
    expect(result.searchValue).toBeNull();
  });
});
