import dynamic, { LoaderComponent } from "next/dynamic";
import { Spinner } from "react-bootstrap";

let hasBaseUrlBeenSet = false;

export async function CreateFormio(url: string, options?: Object | undefined) {
    const { Formio } = await import("formiojs");

    if (!hasBaseUrlBeenSet) {
        console.debug(
            "Setting Formio base URL to",
            process.env.NEXT_PUBLIC_FORMIO_BASE_URL
        );
        Formio.setBaseUrl(process.env.NEXT_PUBLIC_FORMIO_BASE_URL);
        hasBaseUrlBeenSet = true;
    }

    const formio = new Formio(url, options);
    return formio;
}

export function FormioComponentLoader<T>(loader: () => LoaderComponent<T>) {
    return dynamic(
        async () => {
            const { Formio } = await import("formiojs");
            if (!hasBaseUrlBeenSet) {
                Formio.setBaseUrl(process.env.NEXT_PUBLIC_FORMIO_BASE_URL);
                hasBaseUrlBeenSet = true;
            }
            return loader();
        },
        {
            ssr: false,
            loading: () => (
                <div className="position-absolute top-50 start-50 translate-middle">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Načítání...</span>
                    </Spinner>
                </div>
            ),
        }
    );
}
