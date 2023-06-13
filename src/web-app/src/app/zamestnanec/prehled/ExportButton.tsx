"use client";

import { exportFormSubmissions } from "@/client/formioClient";
import { saveAs } from "file-saver";
import { useSession } from "next-auth/react";
import { Button } from "react-bootstrap";
import { toast } from "react-toastify";

/**
 * Button for exporting a form submissions as CSV. On failure, an error modal is shown.
 */
export default function ExportButton({ formId }: ExportButtonProps) {
    const session = useSession();
    const token = session.data?.user.formioToken;

    return (
        <>
            <Button
                onClick={async () => {
                    let blob;
                    try {
                        blob = await exportFormSubmissions(
                            token!,
                            formId,
                            "csv"
                        );
                    } catch (e) {
                        console.error(e);
                        toast.error("Export dat selhal");
                        return;
                    }

                    saveAs(blob, "export.csv");
                }}
                disabled={!token}
            >
                Export CSV
            </Button>
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
