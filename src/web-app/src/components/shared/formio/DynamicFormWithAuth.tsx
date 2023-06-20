"use client";

import { loadFormByPath, submitForm } from "@/client/formioClient";
import { Submission } from "@/types/submission";
import { FormProps } from "@formio/react/lib/components/Form";
import { useSession } from "next-auth/react";
import { Alert, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import { useSmartFetch } from "../../../hooks/useSmartFetch";
import DynamicForm from "./DynamicForm";

/**
 * A dynamic form that uses the user's formio token to authenticate.
 * @param formProps most of the props are passed to the Form component from `@react/formio`
 * but there are a few changes. The `src` prop and the `form` prop are removed.
 * The new `relativeFormPath` prop will be used to manually fetch the form from the formio API and the result
 * will be passed to the Form component using the `form` prop. The `onSubmitDone` prop is required,
 * to force notification of the user and it is run after the form is successfully submitted. The `onSubmitFail`
 * prop is required, to force notification of the user and it is run after the form is unsuccessfully submitted.
 * By default the form is submitted to the `formProps.absoluteSrc` using a POST request. You can override this
 * behavior by providing your own `formProps.onSubmit` function.
 *
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
    }
) {
    const { data } = useSession();
    const {
        isLoading,
        isError,
        error,
        data: form,
    } = useSmartFetch({
        queryFn: () => {
            const result = loadFormByPath(
                formProps.relativeFormPath,
                data!.user.formioToken
            );
            if (result === null) throw new Error("Form not found");
            return result;
        },
        enabled: !!data?.user.formioToken,
    });

    if (isLoading)
        return (
            <div className="position-absolute top-50 start-50 translate-middle">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Načítání...</span>
                </Spinner>
            </div>
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
                await submitForm(data.user.formioToken, form.path, submission);
            } catch (e) {
                console.error(e);
                toast.error("Odeslání formuláře selhalo, zkuste to znovu");
            }
        }
    };

    return (
        <DynamicForm
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
        />
    );
}
