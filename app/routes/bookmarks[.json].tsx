import {
  createExportAction,
  createExportLoader,
} from "~/utils/bookmark-exports.server";

export const loader = createExportLoader("json");

export const action = createExportAction("json");
