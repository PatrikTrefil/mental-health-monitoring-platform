import { ToastContainer } from "react-toastify";

import "@/styles/globals.css";
import "bootstrap/dist/css/bootstrap.css";
import "formiojs/dist/formio.full.min.css";
import "react-toastify/dist/ReactToastify.min.css";
import { Providers } from "./providers";

export default function RootLayout({
    // Layouts must accept a children prop.
    // This will be populated with nested layouts or pages
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="cs">
            <body>
                <Providers>
                    {children}
                    <ToastContainer
                        pauseOnFocusLoss={false}
                        autoClose={false}
                        position="bottom-right"
                        theme="colored"
                    />
                </Providers>
            </body>
        </html>
    );
}
