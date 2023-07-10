"use client";
import { loadFormById, updateForm } from "@/client/formManagementClient";
import DynamicFormBuilder from "@/components/shared/formio/DynamicFormBuilder";
import DynamicFormEdit from "@/components/shared/formio/DynamicFormEdit";
import { useSmartFetch } from "@/hooks/useSmartFetch";
import { Form } from "@/types/formManagement/forms";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
    Button,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    ModalTitle,
} from "react-bootstrap";
import Alert from "react-bootstrap/Alert";
import Spinner from "react-bootstrap/Spinner";

/**
 * Status of form edit
 */
enum EditStatus {
    /**
     * User has not attempted to save form yet (or has reset the status)
     */
    NOT_SUBMITTED,
    /**
     * User has attempted to save form, but saving failed.
     */
    EDIT_FAILED,
    /**
     * User has attempted to save form, and saving succeeded.
     */
    EDIT_SUCCEEDED,
}
/**
 * Page for editing form with given form id (from url)
 */
export default function ClientEditFormPage({ formId }: { formId: string }) {
    const router = useRouter();
    const [editStatus, setEditStatus] = useState<EditStatus>(
        EditStatus.NOT_SUBMITTED
    );

    const { data } = useSession();

    const {
        data: form,
        isLoading,
        isError,
        error: errorMsg,
    } = useSmartFetch<Form, string>({
        enabled: !!data?.user.formioToken,
        queryFn: async () => {
            let result: Awaited<ReturnType<typeof loadFormById>>;
            try {
                result = await loadFormById(formId, data!.user.formioToken);
            } catch (e) {
                console.error("Failed to load form", e);
                throw "Požadavek na server selhal.";
            }
            if (result === null) throw "Formulář s předaným ID neexistuje.";
            return result;
        },
    });

    if (isError)
        return (
            <>
                <Alert variant="danger">
                    <Alert.Heading>Načítání formuláře selhalo</Alert.Heading>
                    {errorMsg}
                </Alert>
                <div className="d-flex flex-wrap gap-2">
                    <Button onClick={() => router.refresh()}>
                        Znovu načíst stránku
                    </Button>
                    <Button href="/zamestnanec/prehled">Zpět na přehled</Button>
                </div>
            </>
        );

    if (isLoading)
        return (
            <div className="position-absolute top-50 start-50 translate-middle">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Načítání...</span>
                </Spinner>
            </div>
        );

    return (
        <>
            <DynamicFormEdit
                saveText="Uložit formulář"
                saveForm={async (formSchema: Form) => {
                    try {
                        if (data)
                            await updateForm(formSchema, data.user.formioToken);
                        else throw new Error("Token not available");
                    } catch (e) {
                        setEditStatus(EditStatus.EDIT_FAILED);
                        return;
                    }
                    setEditStatus(EditStatus.EDIT_SUCCEEDED);
                }}
                form={form}
            >
                <DynamicFormBuilder />
            </DynamicFormEdit>
            <Modal show={editStatus === EditStatus.EDIT_FAILED}>
                <ModalHeader>
                    <ModalTitle>Úprava selhala</ModalTitle>
                </ModalHeader>
                <ModalBody>Odeslání upraveného formuláře selhalo</ModalBody>
                <ModalFooter>
                    <Button
                        variant="secondary"
                        onClick={() => setEditStatus(EditStatus.NOT_SUBMITTED)}
                    >
                        Zavřít
                    </Button>
                </ModalFooter>
            </Modal>
            <Modal show={editStatus === EditStatus.EDIT_SUCCEEDED}>
                <ModalHeader>
                    <ModalTitle>Formulář upraven</ModalTitle>
                </ModalHeader>
                <ModalBody>Formulář byl úspěšně upraven.</ModalBody>
                <ModalFooter>
                    <Button
                        variant="secondary"
                        onClick={() => router.push("/zamestnanec/prehled")}
                    >
                        Zavřít
                    </Button>
                </ModalFooter>
            </Modal>
        </>
    );
}
