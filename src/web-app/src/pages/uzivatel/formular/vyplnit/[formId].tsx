import DynamicFormWithAuth from "@/components/shared/formio/DynamicFormWithAuth";
import { useRouter } from "next/router";
import { toast } from "react-toastify";

/**
 * Page for filling out form with given form id (from url)
 */
export default function FillOutFormPage() {
    const router = useRouter();
    const formId = router.query.formId;

    return (
        <DynamicFormWithAuth
            absoluteSrc={`${process.env.NEXT_PUBLIC_FORMIO_BASE_URL}/form/${formId}`}
            onSubmitDone={async (data: unknown) => {
                toast.success("Formulář byl úspěšně odeslán");
                router.push("/uzivatel/prehled");
            }}
            onSubmitFail={() => {
                toast.error("Formulář se nepodařilo odeslat");
                console.error("Failed to submit form");
            }}
        />
    );
}
