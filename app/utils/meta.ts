import type { V2_HtmlMetaDescriptor } from "@remix-run/node";
import { APP_AUTHOR_HANDLE, APP_URL } from "./misc";

export function generateSocialImageMeta(props: {
  vendor: "twitter" | "og";
  src: string;
  alt?: string | undefined;
  mimeType?: "image/gif" | "image/jpeg" | "image/png" | undefined;
  width?: number | undefined;
  height?: number | undefined;
}): V2_HtmlMetaDescriptor[] {
  const metaKey = props.vendor === "twitter" ? "name" : "property";
  const metaPrefix = `${props.vendor}:image` as const;

  const output = [
    {
      [metaKey]: metaPrefix,
      content: `${APP_URL}/${props.src.replace(/^\//, "")}`,
    },
  ];
  if (props.alt) {
    output.push({
      [metaKey]: `${metaPrefix}:alt`,
      content: props.alt,
    });
  }
  if (props.mimeType) {
    output.push({
      [metaKey]: `${metaPrefix}:type`,
      content: props.mimeType,
    });
  }
  if (props.width) {
    output.push({
      [metaKey]: `${metaPrefix}:width`,
      content: String(props.width),
    });
  }
  if (props.height) {
    output.push({
      [metaKey]: `${metaPrefix}:height`,
      content: String(props.height),
    });
  }

  return output satisfies V2_HtmlMetaDescriptor[];
}

export function generateSocialMeta(props: {
  title: string;
  description: string;
  image?: Omit<Parameters<typeof generateSocialImageMeta>[0], "vendor">;
}): V2_HtmlMetaDescriptor[] {
  const { title, description } = props;
  const image = {
    src: "/favicons/opengraph-image.png",
    alt: "Screenshot of the homepage",
    ...props.image,
  };
  return [
    /* OpenGraph */
    { property: "og:type", content: "website" },
    { property: "og:url", content: APP_URL },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    ...generateSocialImageMeta({ ...image, vendor: "og", src: image.src }),

    /* Twitter / X */
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:site", content: `@${APP_AUTHOR_HANDLE}` },
    { name: "twitter:creator", content: `@${APP_AUTHOR_HANDLE}` },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    ...generateSocialImageMeta({ ...image, vendor: "twitter", src: image.src }),
  ] satisfies V2_HtmlMetaDescriptor[];
}
