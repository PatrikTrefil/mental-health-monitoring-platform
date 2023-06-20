"use client";

import { submitForm } from "@/client/formioClient";
import DynamicFormWithAuth from "@/components/shared/formio/DynamicFormWithAuth";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Alert } from "react-bootstrap";
import { toast } from "react-toastify";

/**
 * Page for filling out form with given form id (from url)
 */
export default function FillOutForm({ formId }: { formId: string }) {
    const router = useRouter();
    const { data } = useSession();
    const taskId = useSearchParams()?.get("taskId");

    if (!taskId)
        return <Alert variant="danger">Nebyl zadán parametr taskId</Alert>;

    return (
        <DynamicFormWithAuth
            relativeFormPath={`/form/${formId}`}
            onSubmitDone={async (data: unknown) => {
                toast.success("Formulář byl úspěšně odeslán");
                router.push("/uzivatel/prehled");
            }}
            onSubmitFail={() => {
                toast.error("Formulář se nepodařilo odeslat");
                console.error("Failed to submit form");
            }}
            onSubmit={async (submission, formPath) => {
                if (!data?.user.formioToken)
                    throw new Error("Formio token not available");
                else if (!taskId) throw new Error("Task id not available");
                else {
                    submission.data.taskId = taskId;
                    await submitForm(
                        data.user.formioToken,
                        formPath,
                        submission
                    );
                }
            }}
        />
    );
}
