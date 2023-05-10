import dynamic from "next/dynamic";

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
        loading: () => <span>Načítání ...</span>,
    }
);

export default DynamicFormEdit;
