"use client";

import { submitForm } from "@/client/formManagementClient";
import { formsQuery } from "@/client/queries/formManagement";
import { trpc } from "@/client/trpcClient";
import DynamicFormWithAuth from "@/components/shared/formio/DynamicFormWithAuth";
import "@/styles/saveDraft.css";
import { DataValue } from "@/types/formManagement/submission";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";

/**
 * Page for filling out form with given form id (from url).
 * @param root0 - Props.
 * @param root0.formId - ID of the form to fill out.
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
            cacheTime: 0,
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

    const {
        data: form,
        isLoading: isLoadingForm,
        isError: isErrorForm,
        error: errorForm,
    } = useQuery({
        ...formsQuery.detail(data?.user.formioToken!, formId),
        enabled: !!data?.user.formioToken,
    });

    if (!taskId)
        return <Alert variant="danger">Nebyl zadán parametr taskId</Alert>;

    if (currentDraft.isLoading || isLoadingForm)
        return (
            <div className="position-absolute top-50 start-50 translate-middle">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Načítání...</span>
                </Spinner>
            </div>
        );

    if (isErrorForm) {
        console.error(errorForm);
        return (
            <Alert variant="danger">
                <Alert.Heading>Načítání formuláře selhalo</Alert.Heading>
                <p>Formulář se nepodařilo načíst.</p>
            </Alert>
        );
    }

    if (form === null)
        return (
            <Alert variant="danger">
                <Alert.Heading>Formulář neexistuje</Alert.Heading>
                <p>Formulář s ID {formId} nebyl nalezen.</p>
            </Alert>
        );

    return (
        <>
            <h1>{form.title}</h1>
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
                            router.push("/uzivatel/");
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
                        leftIcon: "bi bi-save",
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
        </>
    );
}

/**
 * Prevents the user from closing the tab or browser window using a `beforeunload` event listener.
 * @param isPreventionActive - Whether the prevention should be active.
 */
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
