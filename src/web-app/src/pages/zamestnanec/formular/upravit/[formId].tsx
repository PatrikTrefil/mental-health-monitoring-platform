import DynamicFormBuilder from "@/components/dynamicFormio/DynamicFormBuilder";
import DynamicFormEdit from "@/components/dynamicFormio/DynamicFormEdit";
import { CreateFormio } from "@/lib/formiojsWrapper";
import { Form } from "@/types/form";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
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
export default function EditFormPage() {
    const router = useRouter();
    const [form, setForm] = useState<Form | null>(null);
    const [editStatus, setEditStatus] = useState<EditStatus>(
        EditStatus.NOT_SUBMITTED
    );
    const [initFormError, setInitFormError] = useState<string | null>(null);

    const { data } = useSession();
    useEffect(
        function initForm() {
            const getForm = async () => {
                if (router.query.formId === undefined) return;

                if (typeof router.query.formId !== "string") {
                    setInitFormError(
                        `Chyba: id formuláře musí byt string (nyní má typ ${typeof router
                            .query.formId})`
                    );
                    return;
                }

                const client = await CreateFormio(
                    `/form/${router.query.formId}`
                );

                let newForm;
                try {
                    newForm = await client.loadForm(undefined, {
                        "x-jwt-token": data?.user.formioToken, // TODO: use react query
                    });
                } catch (e) {
                    setInitFormError(`Chyba: načítání formuláře selhalo: ${e}`);
                    return;
                }
                setForm(newForm);
            };
            getForm();
        },
        [router, data]
    );

    const formInitFailed = initFormError !== null;
    if (formInitFailed)
        return (
            <>
                <Alert variant="danger">{initFormError}</Alert>
                <div className="d-flex flex-wrap gap-2">
                    <Button onClick={() => router.reload()}>
                        Znovu načíst stránku
                    </Button>
                    <Button href="/zamestnanec/prehled">Zpět na přehled</Button>
                </div>
            </>
        );

    const isFormLoading = form === null || data?.user.formioToken === undefined;
    if (isFormLoading)
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
                saveForm={(formSchema: unknown) => {
                    try {
                        saveFormToServer(formSchema, data.user.formioToken);
                    } catch (e) {
                        setEditStatus(EditStatus.EDIT_FAILED);
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

/**
 * Save form schema to server.
 * @param formSchema Form schema to save to server
 * @throws Error if saving fails
 */
async function saveFormToServer(formSchema: unknown, formioToken: string) {
    const client = await CreateFormio(process.env.NEXT_PUBLIC_FORMIO_BASE_URL);
    await client.saveForm(formSchema, {
        "x-jwt-token": formioToken,
    });
}
