"use client";
import ErrorAlert from "@/components/shared/errorAlert";
import ErrorProps from "@/types/errorProps";

/**
 * Catch errors in root layout or template.
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
