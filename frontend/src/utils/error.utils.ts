import { AxiosError } from "axios";
import { ErrorResponse } from "../types";

export const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof AxiosError) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return axiosError.response?.data?.message || axiosError.message || fallback;
  } else if (error instanceof Error) {
    return error.message;
  }
  return fallback;
};
