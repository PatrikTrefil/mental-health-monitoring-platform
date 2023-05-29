import DynamicForm from "@/components/dynamicFormio/DynamicForm";
import { useRouter } from "next/router";
import { Button } from "react-bootstrap";
import Alert from "react-bootstrap/Alert";

/**
 * Page for filling out form with given form id (from url)
 */
export default function FillOutFormPage() {
    const router = useRouter();
    const formId = router.query.formId;

    if (typeof formId !== "string")
        return (
            <>
                <Alert variant="danger">
                    Chyba: id formuláře musí byt string (nyní má typ{" "}
                    {typeof formId})
                </Alert>
                <Button href="/prehled">Zpět na přehled</Button>
            </>
        );

    return <DynamicForm src={`/form/${formId}`} />;
}
