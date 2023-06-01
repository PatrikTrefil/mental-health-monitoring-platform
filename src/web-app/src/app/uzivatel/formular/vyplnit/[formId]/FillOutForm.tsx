"use client";

import DynamicFormWithAuth from "@/components/shared/formio/DynamicFormWithAuth";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

/**
 * Page for filling out form with given form id (from url)
 */
export default function FillOutForm({ formId }: { formId: string }) {
    const router = useRouter();

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
