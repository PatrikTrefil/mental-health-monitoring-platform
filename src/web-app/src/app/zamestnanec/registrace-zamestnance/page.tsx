import { Metadata } from "next";
import RegistrationForm from "./RegistrationForm";

export const metadata: Metadata = {
    title: "Registrace zaměstnance",
};

/**
 * Page for registering a new employee.
 */
export default function RegistraceZamestnancePage() {
    return <RegistrationForm />;
}
