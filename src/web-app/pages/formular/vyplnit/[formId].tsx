import { useRouter } from "next/router";
import DynamicForm from "../../../components/dynamicFormio/DynamicForm";
import { UserRoleTitles } from "../../../redux/users";
import WithAuth from "../../../components/WithAuth";

export default WithAuth(
    <FillOutFormPage />,
    "/login",
    UserRoleTitles.KLIENT_PACIENT
);

/**
 * Page for filling out form with given form id (from url)
 */
function FillOutFormPage() {
    const router = useRouter();
    const formId = router.query.formId;

    // TODO: show error to user instead of throwing
    if (typeof formId !== "string") throw new Error("formId is not a string");

    return <DynamicForm src={`/form/${formId}`} />;
}
