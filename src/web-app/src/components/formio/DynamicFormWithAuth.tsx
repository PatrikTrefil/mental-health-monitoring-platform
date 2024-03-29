"use client";

import { loadFormByPath, submitForm } from "@/client/formManagementClient";
import { useSmartFetch } from "@/hooks/useSmartFetch";
import { Component, Form } from "@/types/formManagement/forms";
import { DataValue, Submission } from "@/types/formManagement/submission";
import { FormProps } from "@formio/react/lib/components/Form";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { Alert, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import DynamicForm from "./DynamicForm";

/**
 * Change event produced by the {@link DynamicForm} component.
 */
export type ChangeEvent = {
    changed?: { component: Component; value: DataValue };
    data: { [key: string]: unknown };
};

/**
 * A dynamic form that uses the user's formio token to authenticate.
 * @param formProps - Most of the props are passed to the Form component from `@react/formio`
 * but there are a few changes. The `src` prop and the `form` prop are removed.
 * The new `relativeFormPath` prop will be used to manually fetch the form from the formio API and the result
 * will be passed to the Form component using the `form` prop. The `onSubmitDone` prop is required,
 * to force notification of the user and it is run after the form is successfully submitted. The `onSubmitFail`
 * prop is required, to force notification of the user and it is run after the form is unsuccessfully submitted.
 * By default the form is submitted to the `formProps.absoluteSrc` using a POST request. You can override this
 * behavior by providing your own `formProps.onSubmit` function.
 * @see DynamicForm
 */
export default function DynamicFormWithAuth(
    formProps: Omit<FormProps, "form" | "onSubmit"> & {
        relativeFormPath: string;
        onSubmitFail?: (error?: string) => void;
        onSubmit?: (
            submission: Submission,
            formPath: string
        ) => void | Promise<void>;
        /**
         * Default values for components, which are attached after the form is loaded from the
         * server and before it is rendered. These values override the default values from the form.
         *
         * This can be useful if you want to prefill the form with some data.
         * This prefill won't trigger validation (no validation errors will be shown).
         */
        defaultValues?: Record<string, DataValue>;
        /**
         * An element to be displayed while the form is loading.
         */
        loadingNode?: JSX.Element;
        modifyFormBeforeRender?: (form: Form) => void;
        onChange?: (e: ChangeEvent) => void;
    }
) {
    const { data } = useSession();
    const [isFormQueryEnabled, setIsFormQueryEnabled] = useState(true);
    const {
        isLoading,
        isError,
        error,
        data: form,
    } = useSmartFetch({
        queryFn: async () => {
            const token = data?.user.formioToken;
            if (!token) throw new Error("User not logged in");

            const result = await loadFormByPath(
                formProps.relativeFormPath,
                token
            );

            if (result === null) throw new Error("Form not found");

            if (formProps.defaultValues)
                for (const [k, v] of Object.entries(formProps.defaultValues)) {
                    const c = result.components.find((c) => c.key === k);
                    if (c) c.defaultValue = v;
                }
            if (formProps.modifyFormBeforeRender)
                formProps.modifyFormBeforeRender(result);

            return result;
        },
        enabled: !!data?.user.formioToken && isFormQueryEnabled,
    });

    if (isLoading)
        return (
            formProps.loadingNode ?? (
                <div className="position-absolute top-50 start-50 translate-middle">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Načítání...</span>
                    </Spinner>
                </div>
            )
        );

    if (isError) {
        console.error(error);
        return <Alert variant="danger">Načítání formuláře selhalo</Alert>;
    }

    const defaultSubmit = async (submission: unknown) => {
        if (!data?.user.formioToken)
            toast.error("Odeslání formuláře selhalo, zkuste to znovu");
        else {
            try {
                await submitForm(form.path, submission, data.user.formioToken);
            } catch (e) {
                console.error(e);
                toast.error("Odeslání formuláře selhalo, zkuste to znovu");
            }
        }
    };

    return (
        <DynamicForm
            loading={formProps.loadingNode}
            form={form}
            {...formProps}
            onSubmit={async (submission: Submission) => {
                try {
                    if (formProps.onSubmit)
                        await formProps.onSubmit(submission, form.path);
                    else await defaultSubmit(submission);
                } catch (e) {
                    if (formProps.onSubmitFail) {
                        if (e instanceof Error)
                            formProps.onSubmitFail(e.message);
                        else formProps.onSubmitFail();
                    }
                    return;
                }

                if (formProps.onSubmitDone) formProps.onSubmitDone();
            }}
            onChange={(e: ChangeEvent) => {
                setIsFormQueryEnabled(false);
                formProps.onChange?.(e);
            }}
        />
    );
}
