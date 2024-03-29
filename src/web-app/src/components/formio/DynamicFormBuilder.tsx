"use client";

import { FormioComponentLoader } from "@/lib/formiojsWrapper";

/**
 * This component is used to dynamically load the Formio Builder component.
 * Use this for all forms, because the "\@formio/react" library does not support
 * server-side rendering.
 * @param root0 - Props.
 * @param root0.loading - An element to be displayed while the form is loading.
 */
export default function DynamicFormBuilder({
    loading,
    ...props
}: { loading?: JSX.Element } & any) {
    const Component = FormioComponentLoader(() => {
        return import("@formio/react").then((mod) => {
            return mod.FormBuilder;
        });
    }, loading);

    return <Component {...props} />;
}
