"use client";

import DynamicFormWithAuth from "@/components/shared/formio/DynamicFormWithAuth";
import { useState } from "react";
import {
    Button,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    ModalTitle,
} from "react-bootstrap";

/**
 * Page for previewing form with given form id (from url)
 */
export default function ClientPreviewFormPage({ formId }: { formId: string }) {
    const [showModal, setShowModal] = useState(false);

    return (
        <>
            <DynamicFormWithAuth
                relativeFormPath={`/form/${formId}`}
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
