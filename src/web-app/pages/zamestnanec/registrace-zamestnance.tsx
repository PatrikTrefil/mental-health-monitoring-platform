import WithAuth from "../../components/WithAuth";
import DynamicForm from "../../components/dynamicFormio/DynamicForm";
import { UserRoleTitles } from "../../redux/users";

export default WithAuth(
    <RegistraceZamestnancePage />,
    "/zamestnanec/login",
    UserRoleTitles.ZAMESTNANEC
);

/**
 * Page for registering a new employee.
 */
function RegistraceZamestnancePage() {
    return <DynamicForm src="/zamestnanec/register" />;
}
