import {
  formatItemsFoundByCount,
  formatMetaTitle,
  isFulfilled,
  isRejected,
  safeRedirect,
  toTitleCase,
} from "./misc";

describe("formatItemsFoundByCount", () => {
  it('returns "No items found" when count is 0 and plural is "items"', () => {
    const result = formatItemsFoundByCount({
      count: 0,
      singular: "item",
      plural: "items",
    });
    expect(result).toEqual("No items found");
  });

  it('returns "Found 1 item" when count is 1 and singular is "item"', () => {
    const result = formatItemsFoundByCount({
      count: 1,
      singular: "item",
      plural: "items",
    });
    expect(result).toEqual("Found 1 item");
  });

  it('returns "Found 2 items" when count is 2 and plural is "items"', () => {
    const result = formatItemsFoundByCount({
      count: 2,
      singular: "item",
      plural: "items",
    });
    expect(result).toEqual("Found 2 items");
  });
});

describe("formatMetaTitle", () => {
  it("returns the title with the app name appended", () => {
    const result = formatMetaTitle("My Page Title");
    expect(result).toEqual("My Page Title | TagsForDays");
  });

  it("returns an empty string when the title is empty", () => {
    const result = formatMetaTitle("");
    expect(result).toEqual("TagsForDays");
  });
});

describe("isFulfilled", () => {
  it("returns true when the promise is fulfilled", async () => {
    const fulfilled = { status: "fulfilled", value: "" } as const;
    const fulfilledPromise = Promise.resolve(fulfilled);
    const result = await Promise.resolve(fulfilledPromise).then(isFulfilled);
    expect(result).toBe(true);
  });

  it("returns false when the promise is rejected", async () => {
    const rejected = { status: "rejected", reason: "" } as const;
    const rejectedPromise = Promise.resolve(rejected);
    const result = await Promise.resolve(rejectedPromise).then(isFulfilled);
    expect(result).toBe(false);
  });
});

describe("isRejected", () => {
  it("returns true when the promise is rejected", async () => {
    const rejected = { status: "rejected", reason: "" } as const;
    const rejectedPromise = Promise.resolve(rejected);
    const result = await Promise.resolve(rejectedPromise).then(isRejected);
    expect(result).toBe(true);
  });

  it("returns false when the promise is fulfilled", async () => {
    const fulfilled = { status: "fulfilled", value: "" } as const;
    const fulfilledPromise = Promise.resolve(fulfilled);
    const result = await Promise.resolve(fulfilledPromise).then(isRejected);
    expect(result).toBe(false);
  });
});

describe("safeRedirect", () => {
  it("returns the fallback URL when the input is null or undefined", () => {
    const result1 = safeRedirect(null);
    const result2 = safeRedirect(undefined);
    expect(result1).toEqual("/");
    expect(result2).toEqual("/");
  });

  it("returns the fallback URL when the input is not a string", () => {
    // @ts-expect-error - Testing invalid input
    const result1 = safeRedirect(123);
    // @ts-expect-error - Testing invalid input
    const result2 = safeRedirect({ url: "/home" });
    expect(result1).toEqual("/");
    expect(result2).toEqual("/");
  });

  it("returns the fallback URL when the input does not start with a slash", () => {
    const result1 = safeRedirect("home");
    const result2 = safeRedirect("https://example.com");
    expect(result1).toEqual("/");
    expect(result2).toEqual("/");
  });

  it("returns the input URL when it is a valid relative URL", () => {
    const result1 = safeRedirect("/");
    const result2 = safeRedirect("/home");
    expect(result1).toEqual("/");
    expect(result2).toEqual("/home");
  });
});

describe("toTitleCase", () => {
  it("capitalizes the first letter of each word", () => {
    const result = toTitleCase("hello world");
    expect(result).toEqual("Hello World");
  });

  it("handles words with mixed case", () => {
    const result = toTitleCase("hElLo wOrLd");
    expect(result).toEqual("Hello World");
  });

  it("handles words with apostrophes", () => {
    const result = toTitleCase("i'm a title");
    expect(result).toEqual("I'm A Title");
  });

  it("handles empty strings", () => {
    const result = toTitleCase("");
    expect(result).toEqual("");
  });
});
