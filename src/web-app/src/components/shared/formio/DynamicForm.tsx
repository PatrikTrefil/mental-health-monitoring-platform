"use client";

import csTranslation from "@/lib/formioTranslation";
import { FormioComponentLoader } from "@/lib/formiojsWrapper";
import { FormProps, Options } from "@formio/react/lib/components/Form";
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
    /**
     * The language to use for the form (must by available in the i18n object in options)
     * This property is not on the options object because the {@link Options} type
     * is incorrect.
     */
    language?: string;
} & FormProps) {
    const Component = FormioComponentLoader(async () => {
        const mod = await import("@formio/react");
        return mod.Form;
    }, loading);

    // add the cs translation if it is not already there
    if (props.options) {
        if (props.options.i18n)
            (props.options.i18n as { [key: string]: unknown }).cs ??=
                csTranslation;
        else props.options.i18n = { cs: csTranslation };
    } else props.options = { i18n: { cs: csTranslation } };

    // set the language to cs if it is not set
    const language = props.language ?? "cs";
    if (props.options)
        // @ts-expect-error
        props.options.language = language;

    return <Component {...props} />;
}
