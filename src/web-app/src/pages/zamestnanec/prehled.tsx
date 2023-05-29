import CurrentUserDetails from "@/components/CurrentUserDetails";
import { FormLineProps, FormList } from "@/components/FormList";
import LogoutButton from "@/components/LogoutButton";
import ExportButton from "@/components/zamestnanec/ExportButton";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { Button } from "react-bootstrap";

/**
 * Prehled (dashboard) page for employees.
 */
export default function PrehledPage() {
    console.log(useSession().data?.user.formioToken);
    return (
        <>
            <Head>
                <title>Zaměstnanec - přehled</title>
            </Head>
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
                </div>
                <div>
                    <h2>Seznam formulářů</h2>
                    <FormList
                        filterOptions={{
                            tags: "klientPacient",
                        }}
                        FormLine={ManagerFormLine}
                    />
                </div>
            </main>
        </>
    );
}
/**
 * Provides a list item with basic information about the form and buttons to edit and delete the given form.
 */
function ManagerFormLine({ form, deleteForm }: FormLineProps) {
    return (
        <li className="d-flex flex-wrap justify-content-between align-content-center list-group-item align-items-baseline">
            {form.name}
            <div className="d-flex flex-wrap gap-2 align-content-center justify-content-center">
                <Button
                    as="a"
                    href={"/zamestnanec/formular/nahled/" + form._id}
                >
                    Náhled
                </Button>
                <Button
                    as="a"
                    href={"/zamestnanec/formular/upravit/" + form._id}
                >
                    Upravit
                </Button>
                <Button onClick={deleteForm}>Smazat</Button>
                <ExportButton formId={form._id} />
            </div>
        </li>
    );
}
