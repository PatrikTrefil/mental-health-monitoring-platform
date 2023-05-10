import dynamic from "next/dynamic";

/**
 * This component is used to dynamically load the Formio Builder component.
 * Use this for all forms, because the "@formio/react" library does not support
 * server-side rendering.
 */
const DynamicFormBuilder = dynamic(
    () =>
        import("@formio/react").then((mod) => {
            return mod.FormBuilder;
        }),
    {
        ssr: false,
        loading: () => <span>Načítání ...</span>,
    }
);

export default DynamicFormBuilder;
