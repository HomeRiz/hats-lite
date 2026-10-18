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
      people: "People",
      mods: "Mods",
    },
    tabList: "HATS Lite sections",
    inUse: "In use",
    menu: "Open navigation menu",
    fileTheme: "Theme in file",
    fileLoading: "Loading theme...",
    fileError: "Could not load this theme.",
  },
  browse: stringsBrowse,
  preview: stringsPreview,
  designer: stringsDesigner,
} as const;
