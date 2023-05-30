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
 *
 * @see DynamicForm
 */
export default function DynamicFormWithAuth(
    formProps: Omit<FormProps, "form"> & {
        absoluteSrc: string;
        onSubmitFail: () => void;
        onSubmitDone: Function;
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
            return response.json();
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

    return (
        <DynamicForm
            form={form}
            {...formProps}
            onSubmit={async (submission: unknown) => {
                const response = await fetch(formProps.absoluteSrc, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "x-jwt-token": data!.user.formioToken,
                    },
                    body: JSON.stringify(submission),
                });
                if (!response.ok) {
                    formProps.onSubmitFail();
                    return;
                }

                formProps.onSubmitDone();
            }}
        />
    );
}