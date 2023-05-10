import { UserRoleTitles } from "../../redux/users";
import LogoutButton from "../../components/LogoutButton";
import CurrentUserDetails from "../../components/CurrentUserDetails";
import WithAuth from "../../components/WithAuth";
import Head from "next/head";
import Link from "next/link";
import { FormLineProps } from "../../components/FormList";
import ClientPatientFillableFormList from "../../components/ClientPatientFillableFormList";
import ExportButton from "../../components/zamestnanec/ExportButton";

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
                <div>
                    <Link href="/formular/vytvorit">Vytvořit formulář</Link>
                </div>
                <div>
                    <Link href="./registrace-zamestnance">
                        Založit účet nového zaměstnance
                    </Link>
                </div>
                <div>
                    <Link href="./registrace-pacienta-klienta">
                        Založit účet nového pacienta/klienta
                    </Link>
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
            <Link href={"/formular/upravit/" + form._id}>Upravit</Link>
            <button onClick={deleteForm}>Smazat</button>
            <ExportButton formId={form._id} />
        </li>
    );
}
