import dynamic from "next/dynamic";

/**
 * This component is used to dynamically load the Formio Form component.
 * Use this for all forms, because the "@formio/react" library does not support
 * server-side rendering.
 */
const DynamicForm = dynamic(
    () =>
        import("@formio/react").then((mod) => {
            return mod.Form;
        }),
    {
        ssr: false,
        loading: () => <span>Načítání ...</span>,
    }
);

export default DynamicForm;
