import { useEffect, useState } from "react";

// Inspired by https://www.youtube.com/watch?v=MHm-2YmWEek

/**
 * Debounce a value (e.g. From an input element).
 * @param value - Value to debounce.
 * @param delayMs - Delay in milliseconds.
 */
export default function useDebounce<TValue>(value: TValue, delayMs = 500) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const id = setTimeout(() => {
            setDebouncedValue(value);
        }, delayMs);

        // If another change happens before the timeout is up, cancel the timeout.
        return () => clearTimeout(id);
    }, [value, delayMs]);

    return debouncedValue;
}
