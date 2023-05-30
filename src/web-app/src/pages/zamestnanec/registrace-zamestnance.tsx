import DynamicForm from "@/components/shared/formio/DynamicForm";

/**
 * Page for registering a new employee.
 */
export default function RegistraceZamestnancePage() {
    return <DynamicForm src={`/zamestnanec/register`} />;
}
