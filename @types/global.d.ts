import type en from "../messages/en.json";
import { type formats } from "../src/i18n/request";

type Formats = typeof formats;
type Messages = typeof en;

declare global {
  // Use type safe message keys with `next-intl`
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface IntlMessages extends Messages {}

  // Use type safe formats with `next-intl`
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface IntlFormats extends Formats {}

  interface CursorShape {
    id: string;
    createdAt: string;
  }
}
