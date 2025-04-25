import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

// Configure dayjs to handle timezones
dayjs.extend(utc);
dayjs.extend(timezone);

export const formatDate = (date: string | Date | Dayjs | null): string => {
  if (!date) return "";
  // Parse as UTC, then convert to local timezone for display
  return dayjs(date).local().format("DD/MM/YYYY");
};

export const formatDateTime = (date: string | Date | Dayjs | null): string => {
  if (!date) return "";
  // Parse as UTC, then convert to local timezone for display
  return dayjs(date).local().format("DD/MM/YYYY HH:mm");
};

export const dateToISOString = (date: Dayjs | null): string | undefined => {
  if (!date) return undefined;
  // Convert to UTC when sending to the server
  return date.utc().toISOString();
};

export const toStartOfDay = (date: Dayjs | null): Dayjs | null => {
  if (!date) return null;
  return date.startOf("day");
};

export const toEndOfDay = (date: Dayjs | null): Dayjs | null => {
  if (!date) return null;
  return date.endOf("day");
};
