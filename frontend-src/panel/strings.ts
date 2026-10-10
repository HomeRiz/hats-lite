import { stringsBrowse } from "./strings.browse";
import { stringsDesigner } from "./strings.designer";
import { stringsPreview } from "./strings.preview";

export const strings = {
  shell: {
    title: "Themes",
    tabs: {
      browse: "Gallery",
      preview: "Preview",
      designer: "Designer",
    },
    tabList: "HATS Lite sections",
    inUse: "In use",
    menu: "Open navigation menu",
    fileTheme: "Theme in file",
  },
  browse: stringsBrowse,
  preview: stringsPreview,
  designer: stringsDesigner,
} as const;
