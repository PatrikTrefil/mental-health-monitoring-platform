import dynamic from "next/dynamic";
import Spinner from "react-bootstrap/Spinner";

/**
 * This component is used to dynamically load the Formio Edit component.
 * Use this for all forms, because the "@formio/react" library does not support
 * server-side rendering.
 */
const DynamicFormEdit = dynamic(
    () =>
        import("@formio/react").then((mod) => {
            return mod.FormEdit;
        }),
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

export default DynamicFormEdit;
