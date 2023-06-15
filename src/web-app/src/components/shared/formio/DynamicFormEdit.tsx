"use client";

import { FormioComponentLoader } from "@/lib/formiojsWrapper";

/**
 * This component is used to dynamically load the Formio Edit component.
 * Use this for all forms, because the "@formio/react" library does not support
 * server-side rendering.
 */
const DynamicFormEdit = FormioComponentLoader(() =>
    import("@formio/react").then((mod) => {
        return mod.FormEdit;
    })
);

export default DynamicFormEdit;
