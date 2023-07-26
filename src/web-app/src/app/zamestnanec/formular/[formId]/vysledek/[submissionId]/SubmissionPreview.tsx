"use client";

import { loadSubmission } from "@/client/formManagementClient";
import { formsQuery } from "@/client/queries/formManagement";
import DynamicFormWithAuth from "@/components/shared/formio/DynamicFormWithAuth";
import { useSmartFetch } from "@/hooks/useSmartFetch";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Alert, Button, Spinner } from "react-bootstrap";

/**
 * Preview of a single submission with given formId and submissionId.
 */
export default function SubmissionPreview(props: {
    /**
     * Id of the form to which the submission belongs.
     */
    formId: string;
    /**
     * Id of the submission to preview.
     */
    submissionId: string;
}) {
    const session = useSession();

    const {
        data: form,
        isLoading: isLoadingForm,
        isError: isErrorForm,
        error: errorForm,
        refetch: refetchForm,
    } = useQuery({
        ...formsQuery.detail(session.data?.user.formioToken!, props.formId),
        enabled: !!session.data?.user.formioToken,
    });

    const {
        data: submission,
        isLoading: isLoadingSubmission,
        isError: isErrorSubmission,
        error: errorSubmission,
        refetch: refetchSubmission,
    } = useSmartFetch({
        queryFn: () =>
            loadSubmission(
                `/form/${props.formId}`,
                props.submissionId,
                session.data!.user.formioToken
            ),
        enabled: !!session.data?.user.formioToken,
    });

    if (isLoadingSubmission || isLoadingForm)
        return (
            <div className="position-absolute top-50 start-50 translate-middle">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Načítání...</span>
                </Spinner>
            </div>
        );

    if (isErrorSubmission || isErrorForm) {
        if (isErrorForm) console.error(errorForm);
        else console.error(errorSubmission);

        return (
            <div className="d-flex justify-content-center">
                <Alert variant="danger">
                    <Alert.Heading>Něco se pokazilo</Alert.Heading>
                    <p>Při načítání dat došlo k chybě.</p>
                    <hr />
                    <div className="d-flex justify-content-end">
                        <Button
                            onClick={() => {
                                if (isErrorSubmission) refetchSubmission();
                                else refetchForm();
                            }}
                        >
                            Zkusit znovu
                        </Button>
                    </div>
                </Alert>
            </div>
        );
    }

    if (form === null)
        return (
            <div className="d-flex justify-content-center">
                <Alert variant="danger">
                    <Alert.Heading>Formulář nenalezen</Alert.Heading>
                    <p>Formulář s ID {props.formId} neexistuje.</p>
                </Alert>
            </div>
        );

    if (submission === null)
        return (
            <div className="d-flex justify-content-center">
                <Alert variant="danger">
                    <Alert.Heading>Odevzdání nenalezeno</Alert.Heading>
                    <p>Odevzdání s ID {props.submissionId} neexistuje.</p>
                </Alert>
            </div>
        );

    return (
        <>
            <h1>Náhled odevzdání formuláře - {form.title}</h1>
            <DynamicFormWithAuth
                relativeFormPath={`/form/${props.formId}`}
                modifyFormBeforeRender={(form) => {
                    for (const component of form.components)
                        component.disabled = true;
                }}
                defaultValues={submission.data}
            />
        </>
    );
}
