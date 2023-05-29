import DynamicForm from "@/components/shared/dynamicFormio/DynamicForm";

/**
 * Page for registering a new employee.
 */
export default function RegistraceZamestnancePage() {
    return <DynamicForm src={`/zamestnanec/register`} />;
}
