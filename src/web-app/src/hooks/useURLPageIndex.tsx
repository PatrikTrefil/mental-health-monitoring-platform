import { pageIndexUrlParamName } from "@/constants/urlParamNames";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * Extracts page index from URL. If the page index parameter is not valid,
 * it will be replaced with 0.
 */
export function useURLPageIndex() {
    const defaultPageIndex = 0;

    const searchParams = useSearchParams()!;
    const router = useRouter();
    const pathname = usePathname();

    const pageIndexParam = searchParams.get(pageIndexUrlParamName);
    let pageIndex =
        pageIndexParam !== null ? Number(pageIndexParam) : defaultPageIndex;

    if (isNaN(pageIndex)) {
        // HACK: Calling toString to avoid TS error (bug in nextjs).
        const newSearchParams = new URLSearchParams(searchParams.toString());
        newSearchParams.set(pageIndexUrlParamName, String(defaultPageIndex));
        router.replace(pathname + "?" + newSearchParams.toString());
        pageIndex = defaultPageIndex;
    }

    return {
        pageIndex,
        setPageIndex: (newValue: string | number) => {
            // HACK: using toString to get around TS error
            const newSearchParams = new URLSearchParams(
                searchParams.toString()
            );
            newSearchParams.set(pageIndexUrlParamName, String(newValue));
            router.replace(pathname + "?" + newSearchParams.toString());
        },
    };
}
