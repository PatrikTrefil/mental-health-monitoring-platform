"use client";

import { FormioComponentLoader } from "@/lib/formiojsWrapper";
import { formEditCsTranslation as csTranslation } from "@/lib/formioTranslation";
import { FormEdit } from "@formio/react";

/**
 * Better prop type for {@link FormEdit} component.
 */
type FormEditProps = {
    [key: string]: unknown;
    options?: {
        i18n: { [key: string]: Record<string, string> };
        language: string;
    };
};

/**
 * This component is used to dynamically load the Formio Edit component.
 * Use this for all forms, because the "@formio/react" library does not support
 * server-side rendering.
 */
export default function DynamicFormEdit({
    loading,
    ...props
}: { loading?: JSX.Element; language?: string } & FormEditProps) {
    const Component = FormioComponentLoader(() => {
        return import("@formio/react").then((mod) => {
            return mod.FormEdit;
        });
    }, loading);

    const language = props.language ?? "cs";

    if (props.options) {
        props.language ??= language;

        if (props.options.language === "cs") {
            if (props.options.i18n)
                (props.options.i18n as { [key: string]: unknown }).cs ??=
                    csTranslation;
            else props.options.i18n = { cs: csTranslation };
        }
    } else props.options = { i18n: { cs: csTranslation }, language };

    return <Component {...props} />;
}
