import "@/styles/globals.css";
import "bootstrap/dist/css/bootstrap.css";
import "formiojs/dist/formio.full.min.css";
import "react-toastify/dist/ReactToastify.min.css";
import { CookieConsent } from "../components/ClientCookieConsent";
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
                <Providers>{children}</Providers>
                <CookieConsent
                    buttonText="Souhlasím"
                    disableStyles={true}
                    buttonClasses="btn btn-primary"
                    containerClasses="alert alert-warning position-fixed m-0 w-100 d-flex justify-content-between flex-wrap"
                    contentClasses="d-flex justify-content-center align-items-center"
                >
                    Tento web používá cookies pro přihlašování uživatelů.
                </CookieConsent>
            </body>
        </html>
    );
}
