"use client";

import { createAction, createForm } from "@/client/formManagementClient";
import { loadRoles } from "@/client/userManagementClient";
import DynamicFormEdit from "@/components/shared/formio/DynamicFormEdit";
import UserRoleTitles from "@/constants/userRoleTitles";
import { useSmartFetch } from "@/hooks/useSmartFetch";
import { WebhookAction } from "@/types/formManagement/action";
import { Component, Form, FormSchema } from "@/types/formManagement/forms";
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

    const { isLoading, isError, error, data } = useSmartFetch({
        queryFn: async () => loadRoles(session.data!.user.formioToken),
        enabled: !!session.data?.user.formioToken,
    });
    const router = useRouter();
    const errorResult = <Alert variant="danger">Něco se pokazilo.</Alert>;

    const [formioErrors, setFormioErrors] = useState<string | null>(null);

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
        const spravceDotaznikuRoleId = data?.find(
            (role) => role.title === UserRoleTitles.SPRAVCE_DOTAZNIKU
        )?._id;
        const zadavatelDotaznikuRoleId = data?.find(
            (role) => role.title === UserRoleTitles.ZADAVATEL_DOTAZNIKU
        )?._id;

        if (!klientPacientRoleId || !spravceDotaznikuRoleId) {
            console.error("Roles of client/patient or employee not found.");
            return errorResult;
        }

        const taskIdComponent: Component = {
            input: true,
            tableView: true,
            key: "taskId",
            label: "ID úkolu",
            protected: false,
            unique: true,
            persistent: true,
            type: "hidden",
            tags: [],
            conditional: {
                show: "",
                when: null,
                eq: "",
            },
            properties: {},
            isNew: false,
            lockKey: true,
            disabled: false,
        };

        const startingFormSchema = {
            components: [],
            access: [
                {
                    type: "read_all",
                    roles: [
                        spravceDotaznikuRoleId,
                        klientPacientRoleId,
                        zadavatelDotaznikuRoleId,
                    ],
                },
            ],
            submissionAccess: [
                {
                    type: "create_own",
                    roles: [klientPacientRoleId],
                },
                {
                    type: "read_all",
                    roles: [zadavatelDotaznikuRoleId],
                },
            ],
            tags: ["klientPacient"],
        };

        return (
            <>
                <Alert
                    variant="danger"
                    show={!!formioErrors}
                    dismissible
                    onClose={() => setFormioErrors(null)}
                >
                    <Alert.Heading>Vytvoření formuláře selhalo.</Alert.Heading>
                    <p>{formioErrors}</p>
                </Alert>
                <DynamicFormEdit
                    saveText="Vytvořit formulář"
                    saveForm={async (formSchema: FormSchema) => {
                        formSchema.components.push(taskIdComponent);
                        let createdForm: Form;
                        try {
                            console.debug("Creating form...");
                            createdForm = await createForm(
                                session.data!.user.formioToken,
                                formSchema
                            );
                        } catch (e) {
                            if (e instanceof Error) {
                                setFormioErrors(e.message);
                            }
                            console.error(e);
                            return;
                        }
                        console.debug("Form created.");
                        const preCreationWebHookActionPartiallyCompleteTask: WebhookAction =
                            {
                                name: "webhook",
                                title: "Partially Complete Task",
                                handler: ["before"],
                                method: ["create"],
                                settings: {
                                    url: `${process.env.NEXT_PUBLIC_INTERNAL_NEXT_SERVER_URL}/api/ukol/castecne-splneni`,
                                    block: true,
                                    forwardToken: true,
                                },
                            };
                        try {
                            console.debug(
                                "Creating pre-creation webhook action..."
                            );
                            await createAction(
                                createdForm._id,
                                preCreationWebHookActionPartiallyCompleteTask,
                                session.data!.user.formioToken
                            );
                        } catch (e) {
                            console.error(e);
                            toast.error("Vytvoření webhooku selhalo.");
                            return;
                        }
                        console.debug("Pre-creation webhook action created.");
                        const postCreationWebHookActionCompleteTask: WebhookAction =
                            {
                                name: "webhook",
                                title: "Complete Task",
                                handler: ["after"],
                                method: ["create"],
                                settings: {
                                    url: `${process.env.NEXT_PUBLIC_INTERNAL_NEXT_SERVER_URL}/api/ukol/splneni`,
                                    block: true,
                                    forwardToken: true,
                                },
                            };
                        try {
                            console.debug(
                                "Creating post-creation webhook action..."
                            );
                            await createAction(
                                createdForm._id,
                                postCreationWebHookActionCompleteTask,
                                session.data!.user.formioToken
                            );
                        } catch (e) {
                            console.error(e);
                            toast.error("Vytvoření webhooku selhalo.");
                            return;
                        }
                        console.debug("Post-creation webhook action created.");
                        const postCreationWebHookActionDeleteDraft: WebhookAction =
                            {
                                name: "webhook",
                                title: "Delete drafts",
                                handler: ["after"],
                                method: ["create"],
                                settings: {
                                    url: `${process.env.NEXT_PUBLIC_INTERNAL_NEXT_SERVER_URL}/api/ukol/smazat-koncept`,
                                    // The request may fail, because there are not any drafts (404),
                                    // which is fine, so we don't block.
                                    block: false,
                                    forwardToken: true,
                                },
                            };
                        try {
                            console.debug(
                                "Creating post-creation webhook to delete draft action..."
                            );
                            await createAction(
                                createdForm._id,
                                postCreationWebHookActionDeleteDraft,
                                session.data!.user.formioToken
                            );
                        } catch (e) {
                            console.error(e);
                            toast.error("Vytvoření webhooku selhalo.");
                            return;
                        }
                        console.debug(
                            "Post-creation webhook to delete draft action created."
                        );

                        toast.success("Formulář byl úspěšně vytvořen.");
                        router.push("/zamestnanec/prehled");
                    }}
                    // Make clients/patients able to fill out the form
                    // and make the employees able to see their submissions
                    form={startingFormSchema}
                />
            </>
        );
    }
}
