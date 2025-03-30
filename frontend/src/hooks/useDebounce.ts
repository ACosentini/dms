import React from "react";

const useDebounce = <T>(
  value: T,
  delay: number,
  callback: (value: T) => void
) => {
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callback(value);
    }, delay) as NodeJS.Timeout;

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay, callback]);
};

export default useDebounce;
