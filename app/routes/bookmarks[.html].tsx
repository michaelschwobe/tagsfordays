import {
  createExportAction,
  createExportLoader,
} from "~/utils/bookmark-exports.server";

export const loader = createExportLoader("html");

export const action = createExportAction("html");
