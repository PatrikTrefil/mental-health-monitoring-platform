"use client";

import { updateUser } from "@/client/userManagementClient";
import DynamicFormWithAuth from "@/components/shared/formio/DynamicFormWithAuth";
import { useSession } from "next-auth/react";
import { Alert, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";

export default function EditClientPatient({
    userId,
    submissionId,
}: {
    userId: string;
    submissionId: string;
}) {
    const { data } = useSession();
    return (
        <>
            <Alert variant="info">
                Při změně uživatelského ID se ztratí párování mezi úkoly a
                uživatelem. Silně se nedoporučuje měnit ID uživatele.
            </Alert>
            <DynamicFormWithAuth
                defaultValues={{
                    id: userId,
                }}
                relativeFormPath={`/klientpacient/register`}
                onSubmit={async (submission) => {
                    if (!data?.user.formioToken) throw new Error("No token");
                    await updateUser(
                        submissionId,
                        submission.data as unknown as {
                            id: string;
                            password: string;
                        },
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
