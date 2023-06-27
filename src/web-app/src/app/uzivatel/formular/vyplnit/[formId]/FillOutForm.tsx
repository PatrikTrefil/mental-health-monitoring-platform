"use client";

import { submitForm } from "@/client/formioClient";
import { trpc } from "@/client/trpcClient";
import DynamicFormWithAuth from "@/components/shared/formio/DynamicFormWithAuth";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Alert, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";

// TODO: write docs about drafts
// TODO: finish all todos
// TODO: button keeps spinning after saving state

/**
 * Page for filling out form with given form id (from url)
 */
export default function FillOutForm({ formId }: { formId: string }) {
    const router = useRouter();
    const { data } = useSession();
    const taskId = useSearchParams()?.get("taskId");
    const upsertDraft = trpc.draft.upsertDraft.useMutation();
    const [isDraftQueryEnabled, setIsDraftQueryEnabled] = useState(true);
    // we need to perform the fetch once without caching
    const currentDraft = trpc.draft.getDraft.useQuery(
        { formId },
        {
            enabled: isDraftQueryEnabled,
        }
    );
    const [isFormStateDirty, setIsFormStateDirty] = useState(false);

    const [
        hasFailureOfDraftLoadingBeenReported,
        setHasFailureOfDraftLoadingBeenReported,
    ] = useState(false);

    useEffect(() => {
        if (currentDraft.isError && !hasFailureOfDraftLoadingBeenReported) {
            setHasFailureOfDraftLoadingBeenReported(true);
            toast.error("Nepodařilo se načíst rozpracovaný formulář");
        }
    }, [currentDraft.isError, hasFailureOfDraftLoadingBeenReported]);

    useEffect(() => {
        const closeHandler = (e: BeforeUnloadEvent) => {
            // www.geeksforgeeks.org/how-to-detect-browser-or-tab-closing-in-javascript/
            e.preventDefault();
            // to support legacy browsers
            e.returnValue = "";
        };
        if (isFormStateDirty)
            window.addEventListener("beforeunload", closeHandler);
        else window.removeEventListener("beforeunload", closeHandler);
    }, [isFormStateDirty]);

    if (!taskId)
        return <Alert variant="danger">Nebyl zadán parametr taskId</Alert>;

    if (currentDraft.isLoading)
        return (
            <div className="position-absolute top-50 start-50 translate-middle">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Načítání...</span>
                </Spinner>
            </div>
        );

    return (
        <DynamicFormWithAuth
            relativeFormPath={`/form/${formId}`}
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
                    if (submission.data.submit) {
                        await submitForm(
                            data.user.formioToken,
                            formPath,
                            submission
                        );
                        toast.success("Formulář byl úspěšně odeslán");
                        router.push("/uzivatel/prehled");
                    } else if (submission.data.saveDraft) {
                        upsertDraft.mutate({ formId, data: submission.data });
                        setIsFormStateDirty(false);
                        toast.success("Stav formuláře byl úspěšně uložen");
                    }
                }
            }}
            defaultValues={currentDraft?.data?.data}
            modifyFormBeforeRender={(form) => {
                form.components.push({
                    label: "Uložit stav",
                    key: "saveDraft",
                    action: "saveState",
                    theme: "primary",
                    type: "button",
                });
            }}
            onChange={() => {
                setIsFormStateDirty(true);
                setIsDraftQueryEnabled(false);
            }}
        />
    );
}
