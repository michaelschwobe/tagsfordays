import { parsePaginationSearchParams } from "./pagination-validation";

describe("parsePaginationSearchParams", () => {
  test("returns skip as 0 when given an EMPTY URLSearchParam", () => {
    const searchParams = new URLSearchParams();
    const result = parsePaginationSearchParams({ searchParams });
    expect(result.skip).toEqual(0);
  });

  test("returns skip as 0 when not given a non-numberlike URLSearchParam", () => {
    const searchParams = new URLSearchParams({ skip: "badvalue" });
    const result = parsePaginationSearchParams({ searchParams });
    expect(result.skip).toEqual(0);
  });
  test("returns skip as number when given numberlike default", () => {
    const searchParams = new URLSearchParams();
    const result = parsePaginationSearchParams({
      defaultSkip: 3,
      searchParams,
    });
    expect(result.skip).toEqual(3);
  });

  test("returns skip as number when given a numberlike URLSearchParam", () => {
    const searchParams = new URLSearchParams({ skip: "5" });
    const result = parsePaginationSearchParams({ searchParams });
    expect(result.skip).toEqual(5);
  });

  test("returns take as 20 when given an EMPTY URLSearchParam", () => {
    const searchParams = new URLSearchParams();
    const result = parsePaginationSearchParams({ searchParams });
    expect(result.take).toEqual(20);
  });

  test("returns take as 20 when not given a non-numberlike URLSearchParam", () => {
    const searchParams = new URLSearchParams({ take: "badvalue" });
    const result = parsePaginationSearchParams({ searchParams });
    expect(result.take).toEqual(20);
  });

  test("returns take as number when given numberlike default", () => {
    const searchParams = new URLSearchParams();
    const result = parsePaginationSearchParams({
      defaultTake: 3,
      searchParams,
    });
    expect(result.take).toEqual(3);
  });

  test("returns take as number when given a numberlike URLSearchParam", () => {
    const searchParams = new URLSearchParams({ take: "5" });
    const result = parsePaginationSearchParams({ searchParams });
    expect(result.take).toEqual(5);
  });
});
