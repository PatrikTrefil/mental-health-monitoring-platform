"use client";

import "./DynamicFormEdit.css";

import { FormioComponentLoader } from "@/lib/formiojsWrapper";
import { formEditCsTranslation as csTranslation } from "@/lib/formioTranslation";

/**
 * Better prop type for FormEdit component from "\@formio/react" component.
 * Used by {@link DynamicFormEdit}.
 */
export type FormEditProps = {
    [key: string]: unknown;
    options?: {
        i18n: { [key: string]: Record<string, string> };
        language: string;
    };
};

/**
 * This component is used to dynamically load the Formio Edit component.
 * Use this for all forms, because the "\@formio/react" library does not support
 * server-side rendering.
 * @param root0 - Props.
 * @param root0.loading - An element to be displayed while the form is loading.
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

    // Props should not be mutated, so let's make a copy.
    const propsClone = { ...props };
    const language = propsClone.language ?? "cs";

    if (propsClone.options) {
        propsClone.language ??= language;

        if (propsClone.options.language === "cs") {
            if (propsClone.options.i18n)
                (propsClone.options.i18n as { [key: string]: unknown }).cs ??=
                    csTranslation;
            else propsClone.options.i18n = { cs: csTranslation };
        }
    } else propsClone.options = { i18n: { cs: csTranslation }, language };

    return <Component {...propsClone} />;
}
