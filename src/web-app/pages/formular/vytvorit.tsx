import DynamicFormBuilder from "../../components/dynamicFormio/DynamicFormBuilder";
import DynamicFormEdit from "../../components/dynamicFormio/DynamicFormEdit";
import WithAuth from "../../components/WithAuth";
import { UserRoleTitles } from "../../redux/users";
import { useAppSelector } from "../../redux/hooks";
import { roleIdSelector } from "../../redux/selectors";
import { useRouter } from "next/router";

export default WithAuth(
    <CreateFormPage />,
    "/zamestnanec/login",
    UserRoleTitles.ZAMESTNANEC
);

/**
 * Page for creating a form.
 */
function CreateFormPage() {
    const klientPacientRoleId = useAppSelector(
        roleIdSelector(UserRoleTitles.KLIENT_PACIENT)
    );
    const zamestnanecRoleId = useAppSelector(
        roleIdSelector(UserRoleTitles.ZAMESTNANEC)
    );
    const router = useRouter();

    if (!klientPacientRoleId || !zamestnanecRoleId)
        return <div>Načítání...</div>;
    else
        return (
            <DynamicFormEdit
                saveText="Vytvořit formulář"
                saveForm={async (formSchema: any) => {
                    const { Formio } = await import("formiojs");

                    const client = new Formio(
                        process.env.NEXT_PUBLIC_FORMIO_BASE_URL as string
                    );
                    try {
                        await client.saveForm(formSchema);
                    } catch (e) {
                        // TODO: show error message
                        throw e;
                    }
                    // TODO: show message box with message and button to go to Prehled instead
                    alert("Formulář byl úspěšně vytvořen");
                    router.push("/zamestnanec/prehled");
                }}
                // Make clients/patients able to fill out the form
                // and make the employees able to see their submissions
                form={{
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
                }}
            >
                <DynamicFormBuilder />
            </DynamicFormEdit>
        );
}
