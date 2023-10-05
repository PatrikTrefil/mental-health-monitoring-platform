"use client";
import ErrorAlert from "@/components/ErrorAlert";
import ErrorProps from "@/types/errorProps";

/**
 * Catch errors in root layout or template.
 * @param props - Props for this component.
 * @see https://nextjs.org/docs/app/building-your-application/routing/error-handling#handling-errors-in-root-layouts
 */
export default function GlobalError(props: ErrorProps) {
    return (
        <html>
            <body>
                <ErrorAlert {...props} />;
            </body>
        </html>
    );
}
