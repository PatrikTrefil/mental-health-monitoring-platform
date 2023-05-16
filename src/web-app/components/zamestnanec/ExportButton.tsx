import { Button } from "react-bootstrap";

/**
 * Button for exporting a form submissions as CSV
 */
export default function ExportButton({ formId }: ExportButtonProps) {
    const token = localStorage.getItem("formioToken");
    // HACK: using link before setting up file saving
    return (
        <Button
            href={`/formio/form/${formId}/export?format=csv&x-jwt-token=${token}`}
            as="a"
        >
            Export CSV
        </Button>
    );

    return (
        <Button
            onClick={async () => {
                const response = await fetch(
                    `/formio/form/${formId}/export?format=csv`
                );
                if (!response.ok)
                    throw Error(`Failed to export form ${formId} as CSV`); // TODO: handle error
                const blob = await response.blob();
                // TODO: implement saving using https://github.com/eligrey/FileSaver.js
            }}
        >
            Export CSV
        </Button>
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
