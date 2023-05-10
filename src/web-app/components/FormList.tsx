import { Form } from "../types/form";
import { useEffect, useState } from "react";

interface FormListProps {
    /**
     * Filter function for forms. If this function returns true, the form is shown.
     * If it returns false, the form is hidden.
     */
    filter: (form: Form) => boolean;
    /**
     * Component to show for each form.
     */
    FormLine: React.ComponentType<FormLineProps>;
}

/**
 * List of forms which are filtered and shown using FormLine.
 */
export function FormList({ filter, FormLine }: FormListProps) {
    const [forms, setForms] = useState<Form[]>([]);

    const refreshFormsState = async () => {
        const { Formio } = await import("formiojs");
        const formio = new Formio(
            process.env.NEXT_PUBLIC_FORMIO_BASE_URL as string
        );
        // TODO: add pagination
        const newForms = await formio.loadForms({
            // HACK: use query params for filtering instead of filter function
            params: {
                limit: 100,
            },
        });
        setForms(newForms);
    };

    const deleteForm = async (form: Form) => {
        const { Formio } = await import("formiojs");
        const formio = new Formio(
            (process.env.NEXT_PUBLIC_FORMIO_BASE_URL as string) +
                "/" +
                form.path
        );
        await formio.deleteForm();
        await refreshFormsState();
    };

    useEffect(function initForms() {
        refreshFormsState();
    }, []);

    const filteredForms = forms.filter(filter);

    return (
        <>
            <button
                onClick={() => {
                    refreshFormsState();
                }}
            >
                Aktualizovat seznam formularu
            </button>
            <ul>
                {filteredForms.map((form) => (
                    <FormLine
                        key={form._id}
                        form={form}
                        deleteForm={() => deleteForm(form)}
                    />
                ))}
            </ul>
        </>
    );
}

export interface FormLineProps {
    /**
     * Form to show.
     */
    form: Form;
    /**
     * Delete the form that is beign shown.
     */
    deleteForm: () => Promise<void>;
}