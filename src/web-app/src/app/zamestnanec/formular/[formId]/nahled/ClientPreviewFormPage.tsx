"use client";

import { formsQuery } from "@/client/queries/formManagement";
import DynamicFormWithAuth from "@/components/shared/formio/DynamicFormWithAuth";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Alert, Spinner } from "react-bootstrap";

/**
 * Page for previewing form with given form id (from url).
 * @param root0 - Props.
 * @param root0.formId - ID of the form to preview.
 */
export default function ClientPreviewFormPage({ formId }: { formId: string }) {
    const session = useSession();

    const {
        data: form,
        isLoading,
        isError,
        error,
    } = useQuery({
        ...formsQuery.detail(session.data?.user.formioToken!, formId),
        enabled: !!session.data?.user.formioToken,
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
        return (
            <Alert variant="danger">
                <Alert.Heading>Něco se pokazilo</Alert.Heading>
                <p>Načítání náhledu formuláře selhalo.</p>
            </Alert>
        );
    }

    if (form === null)
        return (
            <Alert variant="danger">
                <Alert.Heading>Formulář neexistuje</Alert.Heading>
                <p>Formulář s ID {formId} neexistuje.</p>
            </Alert>
        );

    return (
        <>
            <h1>Náhled formuláře - {form.title}</h1>
            <DynamicFormWithAuth
                relativeFormPath={`/form/${formId}`}
                options={{
                    readOnly: true,
                }}
            />
        </>
    );
}
