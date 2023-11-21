import type { HttpHandler } from "msw";
import { http, HttpResponse, passthrough } from "msw";

const miscHandlers: HttpHandler[] = [
  http.get("chrome-extension://*", passthrough),

  ...(process.env["REMIX_DEV_ORIGIN"]
    ? [http.post(`${process.env["REMIX_DEV_ORIGIN"]}ping`, passthrough)]
    : []),
];

const assetHandlers: HttpHandler[] = [
  http.get("/build/*", passthrough),
  http.get("/favicons/*", passthrough),
  http.get("/icons.svg", passthrough),
];

const externalHandlers: HttpHandler[] = [
  // Intercept all favicon requests
  http.get("https://icons.duckduckgo.com/*", async () => {
    return new HttpResponse(null, { status: 404 });
  }),

  // Intercept all HEAD/status requests
  http.head("*", async ({ request }) => {
    switch (request.url) {
      case "https://remix.run/":
        return new HttpResponse("", { status: 200 });
      case "https://www.typescriptlang.org/":
        return new HttpResponse("", { status: 404 });
      default:
        return new HttpResponse("", { status: 500 });
    }
  }),
];

export const handlers: HttpHandler[] = [
  ...miscHandlers,
  ...assetHandlers,
  ...externalHandlers,
];
