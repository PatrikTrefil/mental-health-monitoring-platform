"use client";

import { FormioComponentLoader } from "@/lib/formiojsWrapper";
import { FormProps } from "@formio/react/lib/components/Form";
import DynamicFormWithAuth from "./DynamicFormWithAuth";

/**
 * This component is used to dynamically load the Formio Form component.
 * Use this for all forms, because the "@formio/react" library does not support
 * server-side rendering.
 *
 * Prefer using the {@link DynamicFormWithAuth} component to take care of the
 * authentication (required to load the form).
 */
export default function DynamicForm({
    loading,
    ...props
}: {
    /**
     * The element to display while the component is loading.
     */
    loading?: JSX.Element;
} & FormProps) {
    const Component = FormioComponentLoader(async () => {
        const mod = await import("@formio/react");
        return mod.Form;
    }, loading);
    return <Component {...props} />;
}
