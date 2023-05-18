import ClientPatientFillableFormList from "@/components/ClientPatientFillableFormList";
import CurrentUserDetails from "@/components/CurrentUserDetails";
import { FormLineProps } from "@/components/FormList";
import LogoutButton from "@/components/LogoutButton";
import WithAuth from "@/components/WithAuth";
import { UserRoleTitles } from "@/redux/users";
import Head from "next/head";
import { Button } from "react-bootstrap";

export default WithAuth(
    <PrehledPage />,
    "/login",
    UserRoleTitles.KLIENT_PACIENT
);

/**
 * Prehled (dashboard) page for clients/patients.
 */
function PrehledPage() {
    return (
        <>
            <Head>
                <title>Přehled</title>
            </Head>
            <main>
                <h1>Přehled</h1>
                <CurrentUserDetails />
                <LogoutButton />
                <h2>Seznam formulářů k vyplnění</h2>
                <ClientPatientFillableFormList FormLine={UserFormLine} />
            </main>
        </>
    );
}

/**
 * List item with functionality for a user with the role "Klient/Pacient".
 *
 * It contains a link to fill the form.
 */
function UserFormLine({ form }: FormLineProps) {
    return (
        <li className="list-group-item">
            Název: {`"${form.name}"`}{" "}
            <Button as="a" href={`/formular/vyplnit/${form._id}`}>
                vyplnit
            </Button>
        </li>
    );
}
