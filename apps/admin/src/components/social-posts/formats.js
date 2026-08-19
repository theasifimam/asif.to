/**
 * Centralized image format definitions for Social Post Studio.
 * All dimensions in pixels. Add new formats here — they will automatically
 * appear in the format selector throughout the studio.
 */

export const IMAGE_FORMATS = {
  "square-1080": {
    id: "square-1080",
    label: "Square",
    width: 1080,
    height: 1080,
    aspect: "1:1",
    platforms: ["instagram", "linkedin", "facebook", "twitter"],
  },
  "portrait-1080": {
    id: "portrait-1080",
    label: "Portrait",
    width: 1080,
    height: 1350,
    aspect: "4:5",
    platforms: ["instagram", "linkedin", "facebook"],
  },
};

export const FORMAT_LIST = Object.values(IMAGE_FORMATS);

export const getFormat = (id) => IMAGE_FORMATS[id] || IMAGE_FORMATS["square-1080"];
