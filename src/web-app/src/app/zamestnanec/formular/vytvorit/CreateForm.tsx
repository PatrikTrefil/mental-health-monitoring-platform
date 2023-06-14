"use client";

import { createForm, loadRoles } from "@/client/formioClient";
import DynamicFormBuilder from "@/components/shared/formio/DynamicFormBuilder";
import DynamicFormEdit from "@/components/shared/formio/DynamicFormEdit";
import { UserRoleTitles } from "@/types/users";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert } from "react-bootstrap";
import Spinner from "react-bootstrap/Spinner";
import { toast } from "react-toastify";

/**
 * Page for creating a form.
 */
export default function CreateForm() {
    const session = useSession();

    // The roles are used only to initialize the form builder,
    // we do not need to keep them updated.
    const [areRolesLoaded, setAreRolesLoaded] = useState(false);

    const { isLoading, isError, error, data, refetch } = useQuery({
        queryKey: ["roles", session.data],
        queryFn: async () => {
            const result = loadRoles(session.data!.user.formioToken);
            setAreRolesLoaded(true);
            return result;
        },
        keepPreviousData: true,
        enabled: !!session.data?.user.formioToken && !areRolesLoaded,
    });
    const router = useRouter();
    const errorResult = <Alert variant="danger">Něco se pokazilo.</Alert>;

    if (isLoading)
        return (
            <div className="position-absolute top-50 start-50 translate-middle">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Načítání...</span>
                </Spinner>
            </div>
        );
    else if (isError) {
        console.error(error);
        return errorResult;
    } else {
        const klientPacientRoleId = data?.find(
            (role) => role.title === UserRoleTitles.KLIENT_PACIENT
        )?._id;
        const zamestnanecRoleId = data?.find(
            (role) => role.title === UserRoleTitles.ZAMESTNANEC
        )?._id;
        if (!klientPacientRoleId || !zamestnanecRoleId) {
            console.error("Roles of client/patient or employee not found.");
            return errorResult;
        }

        const startingFormSchema = {
            access: [
                {
                    type: "read_all",
                    roles: [zamestnanecRoleId, klientPacientRoleId],
                },
            ],
            submissionAccess: [
                {
                    type: "create_own",
                    roles: [klientPacientRoleId],
                },
            ],
            tags: ["klientPacient"],
        };

        return (
            <>
                <DynamicFormEdit
                    saveText="Vytvořit formulář"
                    saveForm={async (formSchema: unknown) => {
                        try {
                            await createForm(
                                session.data!.user.formioToken,
                                formSchema
                            );
                        } catch (e) {
                            console.error(e);
                            toast.error("Vytvoření formuláře selhalo.");
                            return;
                        }

                        toast.success("Formulář byl úspěšně vytvořen.");
                        router.push("/zamestnanec/prehled");
                    }}
                    // Make clients/patients able to fill out the form
                    // and make the employees able to see their submissions
                    form={startingFormSchema}
                >
                    <DynamicFormBuilder />
                </DynamicFormEdit>
            </>
        );
    }
}
