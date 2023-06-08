import CurrentUserDetails from "@/components/shared/CurrentUserDetails";
import LogoutButton from "@/components/shared/LogoutButton";
import { Button } from "@/components/shared/client-react-bootstrap";
import { Metadata } from "next";
import FormDefinitionsTable from "./FormDefinitionsTable";

export const metadata: Metadata = {
    title: "Zaměstnanec - přehled",
};

/**
 * Prehled (dashboard) page for employees.
 */
export default function PrehledPage() {
    return (
        <main>
            <h1>Zaměstnanec - přehled</h1>
            <CurrentUserDetails />
            <LogoutButton />
            <div className="d-flex flex-wrap gap-2 mt-2">
                <Button as="a" href="/zamestnanec/formular/vytvorit">
                    Vytvořit formulář
                </Button>
                <Button as="a" href="./registrace-zamestnance">
                    Založit účet nového zaměstnance
                </Button>
                <Button as="a" href="./sprava-klientu-pacientu">
                    Správa klientů/pacientů
                </Button>
                <Button as="a" href="./zadavani-ukolu">
                    Zadat úkol
                </Button>
            </div>
            <div>
                <h2>Definice formulářů</h2>
                <FormDefinitionsTable />
            </div>
        </main>
    );
}
