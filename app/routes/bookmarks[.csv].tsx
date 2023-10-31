import {
  createExportAction,
  createExportLoader,
} from "~/utils/bookmark-exports.server";

export const loader = createExportLoader("csv");

export const action = createExportAction("csv");
