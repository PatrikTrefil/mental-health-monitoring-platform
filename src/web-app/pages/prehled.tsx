import LogoutButton from "../components/LogoutButton";
import CurrentUserDetails from "../components/CurrentUserDetails";
import WithAuth from "../components/WithAuth";
import { UserRoleTitles } from "../redux/users";
import Head from "next/head";

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
            </main>
        </>
    );
}
