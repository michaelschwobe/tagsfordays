import {
  createExportAction,
  createExportLoader,
} from "~/utils/bookmark-exports.server";

export const loader = createExportLoader("txt");

export const action = createExportAction("txt");
