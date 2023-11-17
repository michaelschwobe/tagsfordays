import { parseBookmarkSearchParams } from "./bookmark-validation";

describe("parseBookmarkSearchParams", () => {
  test("returns searchKey as string when given a valid bookark key", () => {
    const searchParams = new URLSearchParams({ searchKey: "url" });
    const result = parseBookmarkSearchParams(searchParams);
    expect(result.searchKey).toEqual("url");
  });

  test("returns searchKey as null when given an invalid bookark key", () => {
    const searchParams = new URLSearchParams({ searchKey: "badkey" });
    const result = parseBookmarkSearchParams(searchParams);
    expect(result.searchKey).toBeNull();
  });

  test("returns searchKey as null when an undefined key", () => {
    const searchParams = new URLSearchParams();
    const result = parseBookmarkSearchParams(searchParams);
    expect(result.searchKey).toBeNull();
  });

  test("returns searchValue as string when given a string of length", () => {
    const searchParams = new URLSearchParams({ searchValue: "somevalue" });
    const result = parseBookmarkSearchParams(searchParams);
    expect(result.searchValue).toEqual("somevalue");
  });

  test("returns searchValue as null when not given a string of length", () => {
    const searchParams = new URLSearchParams({ searchValue: "" });
    const result = parseBookmarkSearchParams(searchParams);
    expect(result.searchValue).toBeNull();
  });

  test("returns searchValue as null when given an undefined key", () => {
    const searchParams = new URLSearchParams();
    const result = parseBookmarkSearchParams(searchParams);
    expect(result.searchValue).toBeNull();
  });

  test("returns skip as number when given a numeric string", () => {
    const searchParams = new URLSearchParams({ skip: "5" });
    const result = parseBookmarkSearchParams(searchParams);
    expect(result.skip).toEqual(5);
  });

  test("returns skip as 0 when not given a numeric string", () => {
    const searchParams = new URLSearchParams({ skip: "badvalue" });
    const result = parseBookmarkSearchParams(searchParams);
    expect(result.skip).toEqual(0);
  });

  test("returns skip as 0 when given an invalid string", () => {
    const searchParams = new URLSearchParams();
    const result = parseBookmarkSearchParams(searchParams);
    expect(result.skip).toEqual(0);
  });

  test("returns take as number when given a numeric string", () => {
    const searchParams = new URLSearchParams({ take: "5" });
    const result = parseBookmarkSearchParams(searchParams);
    expect(result.take).toEqual(5);
  });

  test("returns take as 20 when not given a numeric string", () => {
    const searchParams = new URLSearchParams({ take: "badvalue" });
    const result = parseBookmarkSearchParams(searchParams);
    expect(result.take).toEqual(20);
  });

  test("returns take as 20 when given an invalid string", () => {
    const searchParams = new URLSearchParams();
    const result = parseBookmarkSearchParams(searchParams);
    expect(result.take).toEqual(20);
  });
});
