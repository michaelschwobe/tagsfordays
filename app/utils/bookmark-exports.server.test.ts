import {
  exportResponse,
  formatExportAsCsv,
  formatExportAsHtml,
  formatExportAsJson,
  formatExportAsMarkdown,
  formatExportAsText,
} from "./bookmark-exports.server";

describe("exportResponse", () => {
  let currDate: Date;

  beforeEach(() => {
    vi.useFakeTimers();
    currDate = new Date("1970-01-01T00:00:00.000+00:00");
    vi.setSystemTime(currDate);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it.each([
    { fileExtension: "csv" as const, mimeType: "text/csv" },
    { fileExtension: "html" as const, mimeType: "text/html" },
    { fileExtension: "json" as const, mimeType: "application/json" },
    { fileExtension: "md" as const, mimeType: "text/markdown" },
    { fileExtension: "txt" as const, mimeType: "text/plain" },
  ])(
    "should return a response with the correct mimeType when given $fileExtension",
    ({ fileExtension, mimeType }) => {
      const data = [
        {
          id: "",
          url: "https://example.com",
          title: null,
          favorite: null,
          createdAt: currDate,
          _count: { tags: 0 },
        },
      ];

      const response = exportResponse({ data, fileExtension });

      expect(response).toBeDefined();
      expect(response).toHaveProperty("body");
      expect(response).toHaveProperty("status", 200);
      expect(response.headers.get("content-disposition")).toContain(
        fileExtension,
      );
      expect(response.headers.get("content-type")).toContain(mimeType);
    },
  );
});

describe("formatExportAsCsv", () => {
  let currDate: Date;

  beforeEach(() => {
    vi.useFakeTimers();
    currDate = new Date("1970-01-01T00:00:00.000+00:00");
    vi.setSystemTime(currDate);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return the mimeType", () => {
    const data = [
      {
        id: "",
        url: "https://example.com",
        title: "Example",
        favorite: null,
        createdAt: currDate,
        _count: { tags: 0 },
      },
    ];
    const result = formatExportAsCsv(data);
    expect(result.mimeType).toEqual("text/csv");
  });

  it("should return the row header", () => {
    const data = [
      {
        id: "",
        url: "https://example.com",
        title: null,
        favorite: null,
        createdAt: currDate,
        _count: { tags: 0 },
      },
    ];
    const result = formatExportAsCsv(data);
    expect(result.body.split("\n")[0]).toEqual("text,href,date");
  });

  it("should return the row items", () => {
    const data = [
      {
        id: "",
        url: "https://example.com/0",
        title: "Example 0",
        favorite: null,
        createdAt: currDate,
        _count: { tags: 0 },
      },
      {
        id: "",
        url: "https://example.com/1",
        title: "Example 1",
        favorite: null,
        createdAt: currDate,
        _count: { tags: 0 },
      },
    ];
    const result = formatExportAsCsv(data);
    expect(result.body.split("\n")[1]).toEqual(
      `"Example 0",https://example.com/0,"Wednesday, December 31, 1969 at 6:00:00 PM CST"`,
    );
    expect(result.body.split("\n")[2]).toEqual(
      `"Example 1",https://example.com/1,"Wednesday, December 31, 1969 at 6:00:00 PM CST"`,
    );
  });

  it("should return a fallback if the title is missing", () => {
    const data = [
      {
        id: "",
        url: "https://example.com",
        title: null,
        favorite: null,
        createdAt: currDate,
        _count: { tags: 0 },
      },
    ];
    const result = formatExportAsCsv(data);

    expect(result.body.split("\n")[1]).toContain("Untitled");
  });

  it("should return quoted/quote-escaped strings for title and createdAt", () => {
    const data = [
      {
        id: "",
        url: "https://example.com",
        title: 'Example, with comma and "quotes"',
        favorite: null,
        createdAt: currDate,
        _count: { tags: 0 },
      },
    ];
    const result = formatExportAsCsv(data);
    expect(result.body.split("\n")[1]).toEqual(
      `"Example, with comma and ""quotes""",https://example.com,"Wednesday, December 31, 1969 at 6:00:00 PM CST"`,
    );
  });
});

describe("formatExportAsHtml", () => {
  let currDate: Date;

  beforeEach(() => {
    vi.useFakeTimers();
    currDate = new Date("1970-01-01T00:00:00.000+00:00");
    vi.setSystemTime(currDate);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return the mimeType", () => {
    const data = [
      {
        id: "",
        url: "https://example.com",
        title: "Example",
        favorite: null,
        createdAt: currDate,
        _count: { tags: 0 },
      },
    ];
    const result = formatExportAsHtml(data);
    expect(result.mimeType).toEqual("text/html");
  });

  it("should return the row items", () => {
    const data = [
      {
        id: "",
        url: "https://example.com/0",
        title: "Example 0",
        favorite: null,
        createdAt: currDate,
        _count: { tags: 0 },
      },
      {
        id: "",
        url: "https://example.com/1",
        title: "Example 1",
        favorite: null,
        createdAt: currDate,
        _count: { tags: 0 },
      },
    ];
    const result = formatExportAsHtml(data);
    expect(result.body).toContain(
      [
        '<DT><A HREF="https://example.com/0" ADD_DATE="0">Example 0</A></DT>',
        '<DT><A HREF="https://example.com/1" ADD_DATE="0">Example 1</A></DT>',
      ].join("\n"),
    );
  });

  it("should return a fallback if the title is missing", () => {
    const data = [
      {
        id: "",
        url: "https://example.com",
        title: null,
        favorite: null,
        createdAt: currDate,
        _count: { tags: 0 },
      },
    ];
    const result = formatExportAsHtml(data);
    expect(result.body).toContain(
      '<DT><A HREF="https://example.com" ADD_DATE="0">Untitled</A></DT>',
    );
  });
});

describe("formatExportAsJson", () => {
  let currDate: Date;

  beforeEach(() => {
    vi.useFakeTimers();
    currDate = new Date("1970-01-01T00:00:00.000+00:00");
    vi.setSystemTime(currDate);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return the mimeType", () => {
    const data = [
      {
        id: "",
        url: "https://example.com",
        title: "Example",
        favorite: null,
        createdAt: currDate,
        _count: { tags: 0 },
      },
    ];
    const result = formatExportAsJson(data);
    expect(result.mimeType).toEqual("application/json");
  });

  it("should return the row items", () => {
    const data = [
      {
        id: "",
        url: "https://example.com/0",
        title: "Example 0",
        favorite: null,
        createdAt: currDate,
        _count: { tags: 0 },
      },
      {
        id: "",
        url: "https://example.com/1",
        title: "Example 1",
        favorite: null,
        createdAt: currDate,
        _count: { tags: 0 },
      },
    ];
    const result = formatExportAsJson(data);
    const expectedBody = JSON.stringify(
      [
        {
          createdAt: currDate,
          title: "Example 0",
          url: "https://example.com/0",
        },
        {
          createdAt: currDate,
          title: "Example 1",
          url: "https://example.com/1",
        },
      ],
      null,
      2,
    );
    expect(result.body).toEqual(expectedBody);
  });

  it("should handle missing titles", () => {
    const data = [
      {
        id: "",
        url: "https://example.com",
        title: null,
        favorite: null,
        createdAt: currDate,
        _count: { tags: 0 },
      },
    ];
    const result = formatExportAsJson(data);
    const expectedBody = JSON.stringify(
      [{ createdAt: currDate, title: null, url: "https://example.com" }],
      null,
      2,
    );
    expect(result.body).toEqual(expectedBody);
  });
});

describe("formatExportAsMarkdown", () => {
  let currDate: Date;

  beforeEach(() => {
    vi.useFakeTimers();
    currDate = new Date("1970-01-01T00:00:00.000+00:00");
    vi.setSystemTime(currDate);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return the mimeType", () => {
    const data = [
      {
        id: "",
        url: "https://example.com",
        title: "Example",
        favorite: null,
        createdAt: currDate,
        _count: { tags: 0 },
      },
    ];
    const result = formatExportAsMarkdown(data);
    expect(result.mimeType).toEqual("text/markdown");
  });

  it("should return the row items", () => {
    const data = [
      {
        id: "",
        url: "https://example.com/0",
        title: "Example 0",
        favorite: null,
        createdAt: currDate,
        _count: { tags: 0 },
      },
      {
        id: "",
        url: "https://example.com/1",
        title: "Example 1",
        favorite: null,
        createdAt: currDate,
        _count: { tags: 0 },
      },
    ];
    const result = formatExportAsMarkdown(data);
    expect(result.body).toContain(
      [
        "- **Example 0**<br /><https://example.com/0><br />Wednesday, December 31, 1969 at 6:00:00 PM CST",
        "- **Example 1**<br /><https://example.com/1><br />Wednesday, December 31, 1969 at 6:00:00 PM CST",
      ].join("\n"),
    );
  });

  it("should return a fallback if the title is missing", () => {
    const data = [
      {
        id: "",
        url: "https://example.com",
        title: null,
        favorite: null,
        createdAt: currDate,
        _count: { tags: 0 },
      },
    ];
    const result = formatExportAsMarkdown(data);
    expect(result.body).toContain(
      "- **Untitled**<br /><https://example.com><br />Wednesday, December 31, 1969 at 6:00:00 PM CST",
    );
  });
});

describe("formatExportAsText", () => {
  let currDate: Date;

  beforeEach(() => {
    vi.useFakeTimers();
    currDate = new Date("1970-01-01T00:00:00.000+00:00");
    vi.setSystemTime(currDate);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return the mimeType", () => {
    const data = [
      {
        id: "",
        url: "https://example.com",
        title: "Example",
        favorite: null,
        createdAt: currDate,
        _count: { tags: 0 },
      },
    ];
    const result = formatExportAsText(data);
    expect(result.mimeType).toEqual("text/plain");
  });

  it("should return the row items", () => {
    const data = [
      {
        id: "",
        url: "https://example.com/0",
        title: "Example 0",
        favorite: null,
        createdAt: currDate,
        _count: { tags: 0 },
      },
      {
        id: "",
        url: "https://example.com/1",
        title: "Example 1",
        favorite: null,
        createdAt: currDate,
        _count: { tags: 0 },
      },
    ];
    const result = formatExportAsText(data);
    expect(result.body).toContain(
      [
        "Example 0\nhttps://example.com/0\nWednesday, December 31, 1969 at 6:00:00 PM CST",
        "Example 1\nhttps://example.com/1\nWednesday, December 31, 1969 at 6:00:00 PM CST",
      ].join("\n\n"),
    );
  });

  it("should return a fallback if the title is missing", () => {
    const data = [
      {
        id: "",
        url: "https://example.com",
        title: null,
        favorite: null,
        createdAt: currDate,
        _count: { tags: 0 },
      },
    ];
    const result = formatExportAsText(data);
    expect(result.body).toContain("Untitled");
  });
});
