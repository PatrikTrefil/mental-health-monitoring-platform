import DynamicFormWithAuth from "@/components/shared/formio/DynamicFormWithAuth";
import { useRouter } from "next/router";

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
                router.push("/uzivatel/prehled"); // TODO: show confirmation
            }}
            onSubmitFail={() => {
                console.error("Failed to submit form"); // TODO:show error
            }}
        />
    );
}
