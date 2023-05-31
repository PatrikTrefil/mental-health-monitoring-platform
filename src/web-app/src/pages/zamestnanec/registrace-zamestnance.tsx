import DynamicFormWithAuth from "@/components/shared/formio/DynamicFormWithAuth";
import { useRouter } from "next/router";
import { toast } from "react-toastify";

/**
 * Page for registering a new employee.
 */
export default function RegistraceZamestnancePage() {
    const router = useRouter();

    return (
        <DynamicFormWithAuth
            absoluteSrc={`${process.env.NEXT_PUBLIC_FORMIO_BASE_URL}/zamestnanec/register`}
            onSubmitDone={() => {
                toast.success("Zaměstnanec byl úspěšně zaregistrován");
                router.push("/zamestnanec/prehled");
            }}
            onSubmitFail={() => {
                console.error("Failed to submit form");
                toast.error("Registrace uživatele selhala");
            }}
        />
    );
}
