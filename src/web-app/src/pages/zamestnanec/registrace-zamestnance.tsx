import DynamicFormWithAuth from "@/components/shared/formio/DynamicFormWithAuth";
import { useRouter } from "next/router";

/**
 * Page for registering a new employee.
 */
export default function RegistraceZamestnancePage() {
    const router = useRouter();

    return (
        <DynamicFormWithAuth
            absoluteSrc={`${process.env.NEXT_PUBLIC_FORMIO_BASE_URL}/zamestnanec/register`}
            onSubmitDone={() => {
                router.push("/zamestnanec/prehled"); // TODO: show confirmation
            }}
            onSubmitFail={() => {
                console.error("Failed to submit form"); // TODO:show error
            }}
        />
    );
}
