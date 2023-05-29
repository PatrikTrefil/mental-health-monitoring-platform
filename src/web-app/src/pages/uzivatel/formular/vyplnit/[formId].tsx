import DynamicForm from "@/components/shared/dynamicFormio/DynamicForm";
import { Form } from "@/types/form";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { Button, Spinner } from "react-bootstrap";
import Alert from "react-bootstrap/Alert";

/**
 * Page for filling out form with given form id (from url)
 */
export default function FillOutFormPage() {
    const router = useRouter();
    const formId = router.query.formId;

    const { data } = useSession();
    const {
        isError,
        isLoading,
        data: form,
    } = useQuery({
        enabled: !!formId && !!data?.user.formioToken,
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
                <Alert variant="danger">Načítání formuláře selhalo</Alert>
                <Button href="/prehled">Zpět na přehled</Button>
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
        <DynamicForm
            form={form}
            onSubmit={async (data: unknown) => {
                const { Formio } = await import("formiojs");
                const formio = new Formio(
                    `${process.env.NEXT_PUBLIC_FORMIO_BASE_URL}/form/${formId}`
                );
                await formio.saveSubmission(data);
                router.push("/uzivatel/prehled"); // TODO: show confirmation
            }}
        />
    );
}
