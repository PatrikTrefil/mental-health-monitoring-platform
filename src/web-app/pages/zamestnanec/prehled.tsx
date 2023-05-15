import ClientPatientFillableFormList from "@/components/ClientPatientFillableFormList";
import CurrentUserDetails from "@/components/CurrentUserDetails";
import { FormLineProps } from "@/components/FormList";
import LogoutButton from "@/components/LogoutButton";
import WithAuth from "@/components/WithAuth";
import ExportButton from "@/components/zamestnanec/ExportButton";
import { UserRoleTitles } from "@/redux/users";
import Head from "next/head";
import { Button } from "react-bootstrap";

export default WithAuth(
    <PrehledPage />,
    "/zamestnanec/login",
    UserRoleTitles.ZAMESTNANEC
);

/**
 * Prehled (dashboard) page for employees.
 */
function PrehledPage() {
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
                    <Button as="a" href="/formular/vytvorit">
                        Vytvořit formulář
                    </Button>
                    <Button as="a" href="./registrace-zamestnance">
                        Založit účet nového zaměstnance
                    </Button>
                    <Button as="a" href="./registrace-pacienta-klienta">
                        Založit účet nového pacienta/klienta
                    </Button>
                </div>
                <div>
                    <h2>Seznam formulářů</h2>
                    <ClientPatientFillableFormList FormLine={ManagerFormLine} />
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
        <li>
            Název: {`"${form.name}"`}{" "}
            <Button as="a" href={"/formular/upravit/" + form._id}>
                Upravit
            </Button>
            <Button onClick={deleteForm}>Smazat</Button>
            <ExportButton formId={form._id} />
        </li>
    );
}
