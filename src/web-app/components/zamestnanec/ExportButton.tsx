import { saveAs } from "file-saver";
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
 * Button for exporting a form submissions as CSV. On failure, an error modal is shown.
 */
export default function ExportButton({ formId }: ExportButtonProps) {
    const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
    const token = localStorage.getItem("formioToken");

    if (!token) return null;

    return (
        <>
            <Button
                onClick={async () => {
                    const response = await fetch(
                        `/formio/form/${formId}/export?format=csv`,
                        {
                            headers: new Headers({
                                "x-jwt-token": token,
                            }),
                        }
                    );
                    if (!response.ok) {
                        setIsErrorModalOpen(true);
                        return;
                    }

                    const blob = await response.blob();
                    saveAs(blob, "export.csv");
                }}
            >
                Export CSV
            </Button>
            <Modal show={isErrorModalOpen}>
                <ModalHeader>
                    <ModalTitle>Export selhal</ModalTitle>
                </ModalHeader>
                <ModalBody>Export do formátu CSV selhal</ModalBody>
                <ModalFooter>
                    <Button
                        variant="secondary"
                        onClick={() => setIsErrorModalOpen(false)}
                    >
                        Zavřít
                    </Button>
                </ModalFooter>
            </Modal>
        </>
    );
}

/**
 * Props for {@link ExportButton}
 */
export interface ExportButtonProps {
    /**
     * Form ID of the form to export
     */
    formId: string;
}
