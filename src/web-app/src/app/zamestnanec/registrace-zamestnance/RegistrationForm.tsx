"use client";

import DynamicFormWithAuth from "@/components/shared/formio/DynamicFormWithAuth";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function RegistrationForm() {
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
