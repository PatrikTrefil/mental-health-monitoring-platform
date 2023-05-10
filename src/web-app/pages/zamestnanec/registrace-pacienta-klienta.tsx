import WithAuth from "@/components/WithAuth";
import DynamicForm from "@/components/dynamicFormio/DynamicForm";
import { UserRoleTitles } from "@/redux/users";

export default WithAuth(
    <RegistracePacientaKlientaPage />,
    "/zamestnanec/login",
    UserRoleTitles.ZAMESTNANEC
);

/**
 * Page for registering a new patient/client.
 */
function RegistracePacientaKlientaPage() {
    return <DynamicForm src="/klientpacient/register" />;
}
