"use client";

import { formCsTranslation as csTranslation } from "@/lib/formioTranslation";
import { FormioComponentLoader } from "@/lib/formiojsWrapper";
import { FormProps, Options } from "@formio/react/lib/components/Form";
import { useMemo } from "react";
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
    // The use memo use very important here,
    // otherwise the component would completely rerender and
    // lose all its internal state (the user would effectively
    // lose all their input)
    const Component = useMemo(() => {
        return FormioComponentLoader(async () => {
            const mod = await import("@formio/react");
            return mod.Form;
        }, loading);
        // Disable the dependency warning because the loading component
        // should not change (if it changed, it would result in the user losing their input)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const language = props.language ?? "cs";

    if (props.options) {
        props.language ??= language;

        // @ts-expect-error
        if (props.options.language === "cs") {
            if (props.options.i18n)
                (props.options.i18n as { [key: string]: unknown }).cs ??=
                    csTranslation;
            else props.options.i18n = { cs: csTranslation };
        }
        // @ts-expect-error
    } else props.options = { i18n: { cs: csTranslation }, language };

    return <Component {...props} />;
}
