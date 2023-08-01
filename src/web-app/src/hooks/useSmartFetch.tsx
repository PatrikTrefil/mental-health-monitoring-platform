"use client";

import { useCallback, useEffect, useState } from "react";

type BaseState = {
    refetch: () => Promise<void>;
};

export type LoadingState = BaseState & {
    status: "loading";
    data: null;
    isLoading: true;
    error: null;
    isError: false;
};
export type SuccessState<TData> = BaseState & {
    status: "success";
    data: TData;
    isLoading: false;
    error: null;
    isError: false;
};

export type ErrorState<TError> = BaseState & {
    status: "error";
    error: TError;
    data: null;
    isLoading: false;
    isError: true;
};

export type SmartFetchState<TData, TError> =
    | LoadingState
    | SuccessState<TData>
    | ErrorState<TError>;

export function useSmartFetch<TData, TError = unknown>({
    queryFn,
    enabled = true,
}: {
    queryFn: () => Promise<TData>;
    enabled?: boolean;
}): SmartFetchState<TData, TError> {
    const [data, setData] = useState<TData>();
    const [status, setStatus] =
        useState<SmartFetchState<TData, TError>["status"]>("loading");
    const [error, setError] = useState<TError | null>();

    useEffect(() => {
        if (error) setStatus("error");
    }, [error]);

    const fetchData = useCallback(async () => {
        try {
            const result = await queryFn();
            setData(result);
        } catch (error) {
            setError(error as TError);
            return;
        }

        setStatus("success");
    }, [queryFn]);

    useEffect(() => {
        if (enabled && status === "loading") fetchData();
    }, [fetchData, enabled, status]);

    const baseState = {
        refetch: fetchData,
    };

    if (status === "loading")
        return {
            data: null,
            isLoading: true,
            status,
            error: null,
            isError: false,
            ...baseState,
        };
    if (status === "error")
        return {
            data: null,
            isLoading: false,
            status,
            error: error as TError,
            isError: true,
            ...baseState,
        };
    return {
        data: data!,
        isLoading: false,
        status,
        error: null,
        isError: false,
        ...baseState,
    };
}
