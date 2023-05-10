import { roleIdSelector } from "../redux/selectors";
import { useAppSelector } from "../redux/hooks";
import { Form } from "../types/form";
import { UserRoleTitles } from "../redux/users";
import { FormLineProps, FormList } from "./FormList";

interface ClientPatientFillableFormListProps {
    FormLine: React.ComponentType<FormLineProps>;
}

/**
 * List of forms that can be filled by a client/patient.
 */
export default function ClientPatientFillableFormList({
    FormLine,
}: ClientPatientFillableFormListProps) {
    const klientPacientRoleId = useAppSelector(
        roleIdSelector(UserRoleTitles.KLIENT_PACIENT)
    );

    const formFilter = (form: Form) => {
        if (klientPacientRoleId === undefined) return false;

        return !!form.submissionAccess.find(
            (accessObj) =>
                accessObj.type === "create_own" &&
                accessObj.roles.find((roleId) => roleId === klientPacientRoleId)
        );
    };

    return <FormList filter={formFilter} FormLine={FormLine} />;
}
