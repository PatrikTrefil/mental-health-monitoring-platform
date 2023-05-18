import WithAuth from "@/components/WithAuth";
import DynamicForm from "@/components/dynamicFormio/DynamicForm";
import { UserRoleTitles } from "@/redux/users";
import { useRouter } from "next/router";
import { useState } from "react";
import {
    Alert,
    Button,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    ModalTitle,
} from "react-bootstrap";

export default WithAuth(
    <PreviewFormPage />,
    "/zamestnanec/login",
    UserRoleTitles.ZAMESTNANEC
);

/**
 * Page for previewing form with given form id (from url)
 */
function PreviewFormPage() {
    const router = useRouter();
    const formId = router.query.formId;
    const [showModal, setShowModal] = useState(false);

    if (typeof formId !== "string")
        return (
            <>
                <Alert variant="danger">
                    Chyba: id formuláře musí byt string (nyní má typ{" "}
                    {typeof formId})
                </Alert>
                <Button href="/zamestnanec/prehled">Zpět na přehled</Button>
            </>
        );

    return (
        <>
            <DynamicForm
                src={`/form/${formId}`}
                onSubmit={() => {
                    setShowModal(true);
                }}
            />
            <Modal show={showModal}>
                <ModalHeader>
                    <ModalTitle>Formulář nebyl odeslán</ModalTitle>
                </ModalHeader>
                <ModalBody>
                    Toto je pouze náhled na formulář a nelze jej odeslat.
                </ModalBody>
                <ModalFooter>
                    <Button onClick={() => setShowModal(false)}>Zavřít</Button>
                </ModalFooter>
            </Modal>
        </>
    );
}