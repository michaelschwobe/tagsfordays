import type { BookmarkImportRaw } from "./bookmark.server";
import {
  filterSecureUniqueUrls,
  parseBookmarkFiles,
  parseSecondsToDate,
} from "./bookmark.server";

function testhelper_createFiles(filesValue: string[]) {
  return filesValue.map((val, idx) => {
    const blob = new Blob([val], { type: "text/html" });
    return new File([blob], `${idx}.html`, { type: "text/html" });
  });
}

describe("parseSecondsToDate", () => {
  it("should return the default date when given a null value", () => {
    const result = parseSecondsToDate(null);
    expect(result).toEqual(new Date());
  });

  it("should return the default date when given a value with length not equal to 10", () => {
    const result = parseSecondsToDate("123456789");
    expect(result).toEqual(new Date());
  });

  it("should return the default date when given a value of 0", () => {
    const result = parseSecondsToDate("0");
    expect(result).toEqual(new Date());
  });

  it("should return the default date when given a non-numeric value", () => {
    const result = parseSecondsToDate("abcde");
    expect(result).toEqual(new Date());
  });

  it("should return the parsed date when given a valid value", () => {
    const sLength10 = 1234567890; // 2009-02-13T23:31:30.000Z
    const result = parseSecondsToDate(`${sLength10}`);
    expect(result).toEqual(new Date(sLength10 * 1000));
  });
});

describe("filterSecureUniqueUrls", () => {
  it("should return an empty array when given an empty array", () => {
    const provided: BookmarkImportRaw[] = [];
    const result = filterSecureUniqueUrls(provided);
    expect(result).toEqual([]);
  });

  it("should return an empty array when given an array with only insecure urls", () => {
    const provided: BookmarkImportRaw[] = [
      { url: "http://example.com", title: "a", createdAt: "" },
      { url: "http://example.org", title: "b", createdAt: "" },
    ];
    const result = filterSecureUniqueUrls(provided);
    expect(result).toEqual([]);
  });

  it("should return an array with only secure unique urls", () => {
    const provided: BookmarkImportRaw[] = [
      { url: "https://example.com", title: "01", createdAt: "" },
      { url: "https://example.org", title: "02", createdAt: "" },
      { url: "http://example.com", title: "x3", createdAt: "" },
      { url: "https://example.com", title: "04", createdAt: "" },
    ];
    const result = filterSecureUniqueUrls(provided);
    expect(result).toEqual([
      { url: "https://example.com", title: "01", createdAt: expect.any(Date) },
      { url: "https://example.org", title: "02", createdAt: expect.any(Date) },
    ]);
  });

  it("should return an array with secure unique urls and truncated titles", () => {
    const provided: BookmarkImportRaw[] = [
      { url: "https://example.com", title: " 0 1 ".repeat(20), createdAt: "" },
      { url: "https://example.org", title: " 0 2 ".repeat(20), createdAt: "" },
      { url: "http://example.com", title: " x 3 ".repeat(20), createdAt: "" },
      { url: "https://example.com", title: " 0 4 ".repeat(20), createdAt: "" },
    ];
    const result = filterSecureUniqueUrls(provided);
    expect(result).toEqual([
      {
        url: "https://example.com",
        title: "0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0",
        createdAt: expect.any(Date),
      },
      {
        url: "https://example.org",
        title: "0 2 0 2 0 2 0 2 0 2 0 2 0 2 0 2 0 2 0 2 0 2 0",
        createdAt: expect.any(Date),
      },
    ]);
  });

  it("should return an array with secure unique urls sorted by createdAt", () => {
    const createdAt1 = 1234567891;
    const createdAt2 = 1234567892;
    const createdAt3 = 1234567893;
    const createdAt4 = 1234567894;
    const provided1: BookmarkImportRaw[] = [
      { url: "https://example.com", title: "01", createdAt: `${createdAt1}` },
      { url: "https://example.com", title: "02", createdAt: `${createdAt2}` },
      { url: "https://example.com", title: "03", createdAt: `${createdAt3}` },
      { url: "https://example.com", title: "04", createdAt: `${createdAt4}` },
      { url: "https://example.org", title: "x4", createdAt: `${createdAt4}` },
    ];
    const provided2: BookmarkImportRaw[] = [
      { url: "https://example.org", title: "x4", createdAt: `${createdAt4}` },
      { url: "https://example.com", title: "04", createdAt: `${createdAt4}` },
      { url: "https://example.com", title: "02", createdAt: `${createdAt2}` },
      { url: "https://example.com", title: "01", createdAt: `${createdAt1}` },
      { url: "https://example.com", title: "03", createdAt: `${createdAt3}` },
    ];

    const result1 = filterSecureUniqueUrls(provided1);
    const result2 = filterSecureUniqueUrls(provided2);

    expect(result1).toEqual([
      {
        url: "https://example.com",
        title: "01",
        createdAt: new Date(createdAt1 * 1000),
      },
      {
        url: "https://example.org",
        title: "x4",
        createdAt: new Date(createdAt4 * 1000),
      },
    ]);
    expect(result2).toEqual([
      {
        url: "https://example.com",
        title: "01",
        createdAt: new Date(createdAt1 * 1000),
      },
      {
        url: "https://example.org",
        title: "x4",
        createdAt: new Date(createdAt4 * 1000),
      },
    ]);
  });
});

describe("parseBookmarkFiles", () => {
  it("should return an empty array when given an empty array", async () => {
    const provided = testhelper_createFiles([]);
    const result = await parseBookmarkFiles(provided);
    expect(result).toEqual([]);
  });

  it("should return an array with one bookmark when given an array with one anchor", async () => {
    const provided = testhelper_createFiles([
      '<a href="https://example.com/1" add_date="1234567890">1</a>',
    ]);
    const result = await parseBookmarkFiles(provided);
    expect(result).toEqual([
      {
        url: "https://example.com/1",
        title: "1",
        createdAt: new Date(1234567890 * 1000),
      },
    ]);
  });

  it("should return an array with multiple bookmarks when given an array with multiple anchors", async () => {
    const provided = testhelper_createFiles([
      '<a href="https://example.com/1" add_date="1234567890">1</a>',
      '<a href="https://example.com/2">2</a><a href="https://example.com/3" add_date="1234567890">3</a>',
    ]);
    const result = await parseBookmarkFiles(provided);
    expect(result).toEqual([
      {
        url: "https://example.com/1",
        title: "1",
        createdAt: new Date(1234567890 * 1000),
      },
      {
        url: "https://example.com/3",
        title: "3",
        createdAt: new Date(1234567890 * 1000),
      },
      {
        url: "https://example.com/2",
        title: "2",
        createdAt: expect.any(Date),
      },
    ]);
  });
});
