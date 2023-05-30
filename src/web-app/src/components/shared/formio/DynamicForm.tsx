import { FormioComponentLoader } from "@/lib/formiojsWrapper";

/**
 * This component is used to dynamically load the Formio Form component.
 * Use this for all forms, because the "@formio/react" library does not support
 * server-side rendering.
 *
 * Prefer using the {@link DynamicFormWithAuth} component to take care of the
 * authentication (required to load the form).
 */
const DynamicForm = FormioComponentLoader(() =>
    import("@formio/react").then((mod) => {
        return mod.Form;
    })
);

export default DynamicForm;
