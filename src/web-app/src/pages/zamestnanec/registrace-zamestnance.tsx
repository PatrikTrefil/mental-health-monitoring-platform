import DynamicForm from "@/components/dynamicFormio/DynamicForm";

/**
 * Page for registering a new employee.
 */
export default function RegistraceZamestnancePage() {
    return <DynamicForm src={`/zamestnanec/register`} />;
}
