import { DEFAULT_COLORS } from "@trustify/utils/constants";

export type UserMetaData = {
  defaultColor: (typeof DEFAULT_COLORS)[number];
  [key: string]: unknown;
};
