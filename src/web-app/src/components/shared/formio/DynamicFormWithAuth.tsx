import { Form } from "@/types/form";
import { FormProps } from "@formio/react/lib/components/Form";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { Alert, Spinner } from "react-bootstrap";
import DynamicForm from "./DynamicForm";

/**
 * A dynamic form that uses the user's formio token to authenticate.
 * @param formProps most of the props are passed to the Form component from `@react/formio`
 * but there are a few changes. The `src` prop and the `form` prop are removed.
 * The new `absoluteSrc` prop will be used to manually fetch the form from the formio API and the result
 * will be passed to the Form component using the `form` prop. The `onSubmitDone` prop is required,
 * to force notification of the user and it is run after the form is successfully submitted. The `onSubmitFail`
 * prop is required, to force notification of the user and it is run after the form is unsuccessfully submitted.
 * By default the form is submitted to the `formProps.absoluteSrc` using a POST request. You can override this
 * behavior by providing your own `formProps.onSubmit` function.
 *
 * @see DynamicForm
 */
export default function DynamicFormWithAuth(
    formProps: Omit<FormProps, "form"> & {
        absoluteSrc: string;
        onSubmitFail?: (error?: string) => void;
    }
) {
    const [isInitialized, setIsInitialized] = useState(false);
    const { data } = useSession();
    const {
        isLoading,
        isError,
        data: form,
        error,
    } = useQuery({
        // eslint-disable-next-line @tanstack/query/exhaustive-deps
        queryKey: ["form", formProps.absoluteSrc],
        queryFn: async () => {
            const response = await fetch(formProps.absoluteSrc, {
                headers: {
                    "x-jwt-token": data!.user.formioToken,
                },
            });
            setIsInitialized(true);
            return (await response.json()) as Form;
        },
        enabled: !!data?.user.formioToken && !isInitialized,
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
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_FORMIO_BASE_URL}${form.path}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-jwt-token": data!.user.formioToken,
                },
                body: JSON.stringify(submission),
            }
        );
        if (!response.ok) {
            throw new Error(
                `Failed to submit form with status code ${response.status}`
            );
        }
    };

    return (
        <DynamicForm
            form={form}
            {...formProps}
            onSubmit={async (submission: unknown) => {
                try {
                    if (formProps.onSubmit) await formProps.onSubmit();
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
