import DynamicFormBuilder from "../../../components/dynamicFormio/DynamicFormBuilder";
import DynamicFormEdit from "../../../components/dynamicFormio/DynamicFormEdit";
import WithAuth from "../../../components/WithAuth";
import { UserRoleTitles } from "../../../redux/users";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Form } from "../../../types/form";

export default WithAuth(
    <EditFormPage />,
    "/zamestnanec/login",
    UserRoleTitles.ZAMESTNANEC
);

/**
 * Page for editing form with given form id (from url)
 */
function EditFormPage() {
    const router = useRouter();
    const [form, setForm] = useState<Form | null>(null);

    useEffect(
        function initForm() {
            const getForm = async () => {
                if (router.query.formId === undefined) return;

                // TODO: show error to user instead of throwing
                if (typeof router.query.formId !== "string")
                    throw new Error("formId is not a string");

                const { Formio } = await import("formiojs");

                const client = new Formio(
                    (process.env.NEXT_PUBLIC_FORMIO_BASE_URL as string) +
                        "/form/" +
                        router.query.formId
                );

                let newForm;
                try {
                    newForm = await client.loadForm();
                } catch (e) {
                    // TODO: show error to user instead of throwing
                    throw e;
                }
                setForm(newForm);
            };
            getForm();
        },
        [router]
    );

    if (form === null) return <div>Načítání...</div>;
    else
        return (
            <DynamicFormEdit
                saveText="Uložit formulář"
                saveForm={(formSchema: unknown) => {
                    // TODO: show error to user instead of throwing
                    saveFormToServer(formSchema);
                    // TODO: show message box with message and button to go to Prehled instead
                    alert("Formulář byl úspěšně uložen");
                    router.push("/zamestnanec/prehled");
                }}
                form={form}
            >
                <DynamicFormBuilder />
            </DynamicFormEdit>
        );
}

/**
 * Save form schema to server.
 * @param formSchema Form schema to save to server
 * @throws Error if saving fails
 */
async function saveFormToServer(formSchema: unknown) {
    const { Formio } = await import("formiojs");

    const client = new Formio(
        process.env.NEXT_PUBLIC_FORMIO_BASE_URL as string
    );
    await client.saveForm(formSchema);
}
