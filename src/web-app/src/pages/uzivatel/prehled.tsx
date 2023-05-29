import CurrentUserDetails from "@/components/CurrentUserDetails";
import { FormLineProps, FormList } from "@/components/FormList";
import LogoutButton from "@/components/LogoutButton";
import Head from "next/head";
import { Button } from "react-bootstrap";

/**
 * Prehled (dashboard) page for clients/patients.
 */
export default function PrehledPage() {
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
                <FormList
                    filterOptions={{
                        tags: "klientPacient",
                    }}
                    FormLine={UserFormLine}
                />
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
            <Button as="a" href={`./formular/vyplnit/${form._id}`}>
                vyplnit
            </Button>
        </li>
    );
}
