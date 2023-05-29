import DynamicForm from "@/components/shared/dynamicFormio/DynamicForm";
import { Form } from "@/types/form";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
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
    Spinner,
} from "react-bootstrap";

/**
 * Page for previewing form with given form id (from url)
 */
export default function PreviewFormPage() {
    const [showModal, setShowModal] = useState(false);

    const router = useRouter();
    const formId = router.query.formId;

    const { data } = useSession();

    const {
        isLoading,
        isError,
        data: form,
    } = useQuery({
        enabled: !!data?.user.formioToken && !!formId,
        // eslint-disable-next-line @tanstack/query/exhaustive-deps
        queryKey: ["form", formId],
        queryFn: async () => {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_FORMIO_BASE_URL}/form/${formId}`,
                {
                    headers: {
                        "x-jwt-token": data!.user.formioToken,
                    },
                }
            );
            return (await response.json()) as Form;
        },
    });

    if (isError)
        return (
            <>
                <Alert variant="danger">
                    Při načítání formuláře došlo k chybě.
                </Alert>
                <Button href="/zamestnanec/prehled">Zpět na přehled</Button>
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
            <DynamicForm
                form={form}
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
