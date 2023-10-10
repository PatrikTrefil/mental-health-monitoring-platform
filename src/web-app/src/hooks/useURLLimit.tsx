import {
    limitUrlParamName,
    pageIndexUrlParamName,
} from "@/constants/urlParamNames";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * Extracts limit of items per page from URL.
 * @param root0 - Options.
 * @param root0.defaultLimit - Default limit of items per page.
 * @param root0.validValues - Valid values of limit of items per page.
 * If the value from URL is not valid, default value is used.
 * @returns Limit of items per page from URL or default.
 */
export function useURLLimit({
    defaultLimit = 10,
    validValues,
}: {
    defaultLimit?: number;
    validValues: number[];
}) {
    const searchParams = useSearchParams()!;
    const router = useRouter();
    const pathname = usePathname();

    const limitParam = searchParams.get(limitUrlParamName);

    let limit =
        limitParam !== null && limitParam !== ""
            ? Number(limitParam)
            : defaultLimit;

    if (isNaN(limit) || !validValues.includes(limit)) {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set(limitUrlParamName, String(defaultLimit));
        router.replace(pathname + "?" + newSearchParams.toString());
        limit = defaultLimit;
    }

    return {
        limit,
        setLimit: (newValue: number | string) => {
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.set(limitUrlParamName, String(newValue));
            newSearchParams.set(pageIndexUrlParamName, "0");
            router.replace(pathname + "?" + newSearchParams.toString());
        },
    };
}
