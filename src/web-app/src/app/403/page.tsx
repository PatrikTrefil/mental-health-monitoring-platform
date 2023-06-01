import { Metadata } from "next";
import Error403Alert from "./Error403Alert";

export const metadata: Metadata = {
    title: "403 - Přístup odepřen",
};

/**
 * Page for displaying 403 error.
 */
export default function Error403Page() {
    return (
        <div className="d-flex align-items-center justify-content-center vh-100">
            <Error403Alert />
        </div>
    );
}
