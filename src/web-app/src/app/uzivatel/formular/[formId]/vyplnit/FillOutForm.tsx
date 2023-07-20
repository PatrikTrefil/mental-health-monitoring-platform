"use client";

import { submitForm } from "@/client/formManagementClient";
import { trpc } from "@/client/trpcClient";
import DynamicFormWithAuth from "@/components/shared/formio/DynamicFormWithAuth";
import "@/styles/saveDraft.css";
import { DataValue } from "@/types/formManagement/submission";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";

/**
 * Page for filling out form with given form id (from url)
 */
export default function FillOutForm({ formId }: { formId: string }) {
    let progressToast = useRef<ReturnType<typeof toast> | null>(null);
    const startLoadingToast = (content: React.ReactNode = "Probíhá ukládání") =>
        (progressToast.current = toast(content, {
            autoClose: false,
            type: toast.TYPE.INFO,
        }));
    const finishLoadingToastWithSuccess = (
        content: React.ReactNode = "Uloženo"
    ) => {
        if (!progressToast.current)
            throw new Error("Progress toast is not initialized");
        toast.update(progressToast.current, {
            render: content,
            type: toast.TYPE.SUCCESS,
            autoClose: 5000,
        });
    };
    const finishLoadingToastWithFailure = (
        content: React.ReactNode = "Nepodařilo se uložit"
    ) => {
        if (!progressToast.current)
            throw new Error("Progress toast is not initialized");
        toast.update(progressToast.current, {
            render: content,
            type: toast.TYPE.ERROR,
            autoClose: 5000,
        });
    };
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
            retry: (_, error) => error.message !== "NOT_FOUND",
        }
    );
    const [isFormStateDirty, setIsFormStateDirty] = useState(false);

    const [
        hasFailureOfDraftLoadingBeenReported,
        setHasFailureOfDraftLoadingBeenReported,
    ] = useState(false);

    useEffect(() => {
        if (currentDraft.isError && !hasFailureOfDraftLoadingBeenReported) {
            if (currentDraft.error.message !== "NOT_FOUND") {
                setHasFailureOfDraftLoadingBeenReported(true);
                toast.error("Nepodařilo se načíst rozpracovaný formulář");
            } else {
                console.debug("Draft not found");
                setIsDraftQueryEnabled(false);
            }
        }
    }, [
        currentDraft.isError,
        currentDraft.error,
        hasFailureOfDraftLoadingBeenReported,
    ]);

    usePreventClose(isFormStateDirty);

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
                        startLoadingToast();
                        try {
                            await submitForm(
                                data.user.formioToken,
                                formPath,
                                submission
                            );
                        } catch (e) {
                            finishLoadingToastWithFailure();
                            console.error("Failed to submit form", e);
                            return;
                        }
                        finishLoadingToastWithSuccess();
                        // set this to remove the warning about unsaved changes
                        setIsFormStateDirty(false);
                        router.push("/uzivatel/prehled");
                    } else if (submission.data.saveDraft) {
                        startLoadingToast();
                        try {
                            upsertDraft.mutate({
                                formId,
                                data: submission.data,
                            });
                        } catch (e) {
                            finishLoadingToastWithFailure();
                            console.error("Failed to save form state", e);
                            return;
                        }
                        finishLoadingToastWithSuccess();
                        setIsFormStateDirty(false);
                    }
                }
            }}
            defaultValues={
                currentDraft?.data?.data as
                    | { [key: string]: DataValue }
                    | undefined
            }
            modifyFormBeforeRender={(form) => {
                form.components.unshift({
                    label: "Uložit koncept",
                    key: "saveDraft",
                    action: "submit",
                    theme: "primary",
                    type: "button",
                    disabled: false,
                });
            }}
            onChange={(e) => {
                if (
                    currentDraft &&
                    e.changed &&
                    currentDraft?.data?.data[e.changed.component.key] !==
                        e.changed.value
                ) {
                    console.debug("Change detected");
                    setIsFormStateDirty(true);
                    setIsDraftQueryEnabled(false);
                }
            }}
        />
    );
}

function usePreventClose(isPreventionActive: boolean) {
    const closeHandler = useMemo(() => {
        return (e: BeforeUnloadEvent) => {
            // www.geeksforgeeks.org/how-to-detect-browser-or-tab-closing-in-javascript/
            e.preventDefault();
            // to support legacy browsers
            e.returnValue = "";
        };
    }, []);

    useEffect(() => {
        if (isPreventionActive) {
            console.debug("Adding beforeunload listener");
            window.addEventListener("beforeunload", closeHandler);
        } else {
            console.debug("Removing beforeunload listener");
            window.removeEventListener("beforeunload", closeHandler);
        }
    }, [isPreventionActive, closeHandler]);
}
