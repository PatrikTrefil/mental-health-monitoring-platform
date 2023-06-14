"use client";

import { useEffect, useState } from "react";

export type LoadingState = {
    status: "loading";
    data: null;
    isLoading: true;
    error: null;
    isError: false;
};
export type SuccessState<TData> = {
    status: "success";
    data: TData;
    isLoading: false;
    error: null;
    isError: false;
};

export type ErrorState<TError> = {
    status: "error";
    error: TError;
    data: null;
    isLoading: false;
    isError: true;
};

export function useSmartFetch<TData, TError = unknown>({
    queryFn,
    enabled = true,
}: {
    queryFn: () => Promise<TData>;
    enabled: boolean;
}): LoadingState | SuccessState<TData> | ErrorState<TError> {
    const [data, setData] = useState<TData>();
    const [status, setStatus] = useState<"error" | "success" | "loading">(
        "loading"
    );
    const [error, setError] = useState<TError | null>();

    useEffect(() => {
        if (error) setStatus("error");
    }, [error]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await queryFn();
                setData(result);
            } catch (error) {
                setError(error as TError);
                return;
            }

            setStatus("success");
        };

        if (enabled && status === "loading") fetchData();
    }, [queryFn, enabled, status]);

    if (status === "loading")
        return {
            data: null,
            isLoading: true,
            status,
            error: null,
            isError: false,
        };
    if (status === "error")
        return {
            data: null,
            isLoading: false,
            status,
            error: error as TError,
            isError: true,
        };
    return {
        data: data!,
        isLoading: false,
        status,
        error: null,
        isError: false,
    };
}
