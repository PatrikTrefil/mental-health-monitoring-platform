"use client";

import { updateSubmission } from "@/client/formioClient";
import DynamicFormWithAuth from "@/components/shared/formio/DynamicFormWithAuth";
import { useSession } from "next-auth/react";
import { Alert, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";

export default function EditEmployee({
    employeeId,
    submissionId,
    formPath,
}: {
    employeeId: string;
    submissionId: string;
    formPath: string;
}) {
    const { data } = useSession();
    return (
        <>
            <Alert variant="info">
                Při změně uživatelského ID se ztratí párování mezi vytvořenými
                úkoly a uživatelem. Silně se nedoporučuje měnit ID uživatele.
            </Alert>
            <DynamicFormWithAuth
                defaultValues={{
                    id: employeeId,
                }}
                relativeFormPath={formPath}
                onSubmit={async (submission) => {
                    if (!data?.user.formioToken) throw new Error("No token");

                    await updateSubmission(
                        formPath,
                        submissionId,
                        submission,
                        data.user.formioToken
                    );
                }}
                onSubmitDone={() => {
                    toast.success("Uživatel úspěšně upraven.");
                }}
                onSubmitFail={(error) => {
                    console.error(error);
                    toast.error("Nepodařilo se upravit uživatele.");
                }}
                loadingNode={
                    <div>
                        <Spinner
                            animation="border"
                            role="status"
                            className="m-auto d-block"
                        >
                            <span className="visually-hidden">Načítání...</span>
                        </Spinner>
                    </div>
                }
            />
        </>
    );
}
