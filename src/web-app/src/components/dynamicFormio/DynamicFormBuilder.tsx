import { FormioComponentLoader } from "@/lib/formiojsWrapper";

/**
 * This component is used to dynamically load the Formio Builder component.
 * Use this for all forms, because the "@formio/react" library does not support
 * server-side rendering.
 */
const DynamicFormBuilder = FormioComponentLoader(() =>
    import("@formio/react").then((mod) => {
        return mod.FormBuilder;
    })
);

export default DynamicFormBuilder;
