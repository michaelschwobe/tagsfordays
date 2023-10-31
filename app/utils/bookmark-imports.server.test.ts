import {
  filterBookmarkImports,
  formatBookmarkCreatedAt,
  formatBookmarkTitle,
  formatBookmarkUrl,
  parseAnchorImports,
  parseBookmarkFiles,
  sortBookmarkImports,
} from "./bookmark-imports.server";

describe("formatBookmarkUrl", () => {
  type Provided = Parameters<typeof formatBookmarkUrl>[0];

  it("should return null when given an empty url", () => {
    const provided: Provided = { url: "" };
    const result = formatBookmarkUrl(provided);
    expect(result).toBeNull();
  });

  it("should return null when given an invalid url", () => {
    const provided: Provided = { url: "https:/ /example.com/" };
    const result = formatBookmarkUrl(provided);
    expect(result).toBeNull();
  });

  it("should return null when given an url with an invalid protocol", () => {
    const provided: Provided = {
      url: "http://example.com/",
      allowedProtocols: ["https"],
    };
    const result = formatBookmarkUrl(provided);
    expect(result).toBeNull();
  });

  it("should return null when given an url with an invalid hostname", () => {
    const provided: Provided = {
      url: "https://example.com/1/2/3/",
      blockedHostnames: ["example.com"],
    };
    const result = formatBookmarkUrl(provided);
    expect(result).toBeNull();
  });

  it("should remove blocked search params from the url", () => {
    const provided: Provided = {
      url: "https://example.com/1/2/3?key1=value1&key2=value2",
      blockedSearchParams: ["key1", "key2"],
    };
    const result = formatBookmarkUrl(provided);
    expect(result).toEqual("https://example.com/1/2/3");
  });

  it("should not remove allowed search params from the url", () => {
    const provided: Provided = {
      url: "https://example.com/1/2/3?key1=value1&key2=value2&key3=value3",
      blockedSearchParams: ["key1", "key3"],
    };
    const result = formatBookmarkUrl(provided);
    expect(result).toEqual("https://example.com/1/2/3?key2=value2");
  });

  it("should remove a trailing slash from the url", () => {
    const provided: Provided = { url: "https://example.com/1/2/3/" };
    const result = formatBookmarkUrl(provided);
    expect(result).toEqual("https://example.com/1/2/3");
  });
});

describe("formatBookmarkTitle", () => {
  it("should return an empty string when given an empty string", () => {
    const result = formatBookmarkTitle("");
    expect(result).toEqual("");
  });

  it("should return a trimmed string when given a string with leading and trailing whitespace", () => {
    const result = formatBookmarkTitle(" 1  2    3 ");
    expect(result).toEqual("1 2 3");
  });
});

describe("formatBookmarkCreatedAt", () => {
  let currDate: Date;

  beforeEach(() => {
    vi.useFakeTimers();
    currDate = new Date(1970, 0, 1);
    vi.setSystemTime(currDate);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return the default date when given a null value", () => {
    const result = formatBookmarkCreatedAt(null);
    expect(result).toEqual(currDate);
  });

  it("should return the default date when given a value of 0", () => {
    const result = formatBookmarkCreatedAt("0");
    expect(result).toEqual(currDate);
  });

  it("should return the default date when given a value with length not equal to 10", () => {
    const resultShort = formatBookmarkCreatedAt("123456789");
    const resultLong = formatBookmarkCreatedAt("12345678901");
    expect(resultShort).toEqual(currDate);
    expect(resultLong).toEqual(currDate);
  });

  it("should return the default date when given a non-numeric value", () => {
    const result = formatBookmarkCreatedAt("abcdefghij");
    expect(result).toEqual(currDate);
  });

  it("should return the parsed date when given a valid value", () => {
    const sLength10 = 1234567890; // 2009-02-13T23:31:30.000Z
    const diffDate = new Date(sLength10 * 1000);
    const result = formatBookmarkCreatedAt(`${sLength10}`);
    expect(result).not.toEqual(currDate);
    expect(result).toEqual(diffDate);
  });
});

describe("sortBookmarkImports", () => {
  type Provided = Parameters<typeof sortBookmarkImports>[0];

  it("should return 0 when given two bookmark imports with the same createdAt date", () => {
    const createdAt = new Date(1234567890 * 1000);
    const providedPartial = { url: "", title: "" };
    const providedA: Provided = { ...providedPartial, createdAt };
    const providedB: Provided = { ...providedPartial, createdAt };
    const result = sortBookmarkImports(providedA, providedB);
    expect(result).toEqual(0);
  });

  it("should return a positive number when given two bookmark imports with different createdAt dates, where the first one is older", () => {
    const createdAtA = new Date(1234567890 * 1000 + 1);
    const createdAtB = new Date(1234567890 * 1000);
    const providedPartial = { url: "", title: "" };
    const providedA: Provided = { ...providedPartial, createdAt: createdAtA };
    const providedB: Provided = { ...providedPartial, createdAt: createdAtB };
    const result = sortBookmarkImports(providedA, providedB);
    expect(result).toBeGreaterThan(0);
  });

  it("should return a negative number when given two bookmark imports with different createdAt dates, where the first one is newer", () => {
    const createdAtA = new Date(1234567890 * 1000);
    const createdAtB = new Date(1234567890 * 1000 + 1);
    const providedPartial = { url: "", title: "" };
    const providedA: Provided = { ...providedPartial, createdAt: createdAtA };
    const providedB: Provided = { ...providedPartial, createdAt: createdAtB };
    const result = sortBookmarkImports(providedA, providedB);
    expect(result).toBeLessThan(0);
  });
});

describe("filterBookmarkImports", () => {
  type Provided = Parameters<typeof filterBookmarkImports>[0];

  it("should return an empty array when given an empty array", () => {
    const provided: Provided = [];
    const result = filterBookmarkImports(provided);
    expect(result).toEqual([]);
  });

  it("should return an empty array when given an array urls equal to empty strings or null", () => {
    const provided: Provided = [
      { url: "", title: "", createdAt: new Date() },
      { url: null, title: "", createdAt: new Date() },
    ];
    const result = filterBookmarkImports(provided);
    expect(result).toEqual([]);
  });

  it("should return an array with unique urls sorted by first in first out", () => {
    const createdAt = new Date(1234567890 * 1000);
    const provided1: Provided = [
      { url: "a", title: "1", createdAt },
      { url: "b", title: "2", createdAt },
      { url: "a", title: "3", createdAt },
      { url: "d", title: "4", createdAt },
      { url: "c", title: "5", createdAt },
      { url: "c", title: "6", createdAt },
    ];
    const provided2: Provided = [
      { url: "d", title: "4", createdAt },
      { url: "c", title: "6", createdAt },
      { url: "c", title: "5", createdAt },
      { url: "b", title: "2", createdAt },
      { url: "a", title: "3", createdAt },
      { url: "a", title: "1", createdAt },
    ];

    const result1 = filterBookmarkImports(provided1);
    const result2 = filterBookmarkImports(provided2);

    expect(result1).toEqual([
      { url: "a", title: "1", createdAt },
      { url: "b", title: "2", createdAt },
      { url: "d", title: "4", createdAt },
      { url: "c", title: "5", createdAt },
    ]);
    expect(result2).toEqual([
      { url: "d", title: "4", createdAt },
      { url: "c", title: "6", createdAt },
      { url: "b", title: "2", createdAt },
      { url: "a", title: "3", createdAt },
    ]);
  });
});

describe("parseAnchorImports", () => {
  type Provided = Parameters<typeof parseAnchorImports>[0];

  it("should return an empty array when given an empty array", () => {
    const provided: Provided = [];
    const result = parseAnchorImports(provided);
    expect(result).toEqual([]);
  });

  it("should return an empty array when given an array with only insecure urls", () => {
    const provided: Provided = [
      { href: "http://example.com", innerHtml: "a", addDate: "" },
      { href: "http://example.org", innerHtml: "b", addDate: "" },
    ];
    const result = parseAnchorImports(provided);
    expect(result).toEqual([]);
  });

  it("should return an array with secure unique urls", () => {
    const provided: Provided = [
      { href: "https://example.com", innerHtml: "01", addDate: "" },
      { href: "https://example.org", innerHtml: "02", addDate: "" },
      { href: "http://example.com", innerHtml: "x3", addDate: "" },
      { href: "https://example.com", innerHtml: "04", addDate: "" },
    ];
    const result = parseAnchorImports(provided);
    expect(result).toEqual([
      { url: "https://example.com", title: "01", createdAt: expect.any(Date) },
      { url: "https://example.org", title: "02", createdAt: expect.any(Date) },
    ]);
  });

  it("should return an array with secure unique urls sorted by createdAt", () => {
    const createdAt1 = 1234567891;
    const createdAt2 = 1234567892;
    const createdAt3 = 1234567893;
    const createdAt4 = 1234567894;
    const provided1: Provided = [
      {
        href: "https://example.com",
        innerHtml: "01",
        addDate: `${createdAt1}`,
      },
      {
        href: "https://example.com",
        innerHtml: "02",
        addDate: `${createdAt2}`,
      },
      {
        href: "https://example.com",
        innerHtml: "03",
        addDate: `${createdAt3}`,
      },
      {
        href: "https://example.com",
        innerHtml: "04",
        addDate: `${createdAt4}`,
      },
      {
        href: "https://example.org",
        innerHtml: "x4",
        addDate: `${createdAt4}`,
      },
    ];
    const provided2: Provided = [
      {
        href: "https://example.org",
        innerHtml: "x4",
        addDate: `${createdAt4}`,
      },
      {
        href: "https://example.com",
        innerHtml: "04",
        addDate: `${createdAt4}`,
      },
      {
        href: "https://example.com",
        innerHtml: "02",
        addDate: `${createdAt2}`,
      },
      {
        href: "https://example.com",
        innerHtml: "01",
        addDate: `${createdAt1}`,
      },
      {
        href: "https://example.com",
        innerHtml: "03",
        addDate: `${createdAt3}`,
      },
    ];

    const result1 = parseAnchorImports(provided1);
    const result2 = parseAnchorImports(provided2);

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
  function testhelper_createFiles(filesValue: string[]) {
    return filesValue.map((val, idx) => {
      const blob = new Blob([val], { type: "text/html" });
      return new File([blob], `${idx}.html`, { type: "text/html" });
    });
  }

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
      `<a href="https://example.com/1" add_date="1234567891">1</a>
       <a href="https://example.com/2">2</a>
       <a href="https://example.com/3" add_date="1234567890">3</a>
      `,
    ]);
    const result = await parseBookmarkFiles(provided);
    expect(result).toEqual([
      {
        url: "https://example.com/2",
        title: "2",
        createdAt: expect.any(Date),
      },
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
    ]);
  });
});
