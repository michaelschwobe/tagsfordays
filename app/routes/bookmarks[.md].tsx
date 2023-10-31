import {
  createExportAction,
  createExportLoader,
} from "~/utils/bookmark-exports.server";

export const loader = createExportLoader("md");

export const action = createExportAction("md");
