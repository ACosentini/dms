import dayjs, { Dayjs } from "dayjs";

export const formatDate = (date: string | Date | Dayjs | null): string => {
  if (!date) return "";
  return dayjs(date).format("DD/MM/YYYY");
};

export const dateToISOString = (date: Dayjs | null): string | undefined => {
  if (!date) return undefined;
  return date.toISOString();
};

export const toStartOfDay = (date: Dayjs | null): Dayjs | null => {
  if (!date) return null;
  return date.startOf("day");
};

export const toEndOfDay = (date: Dayjs | null): Dayjs | null => {
  if (!date) return null;
  return date.endOf("day");
};
