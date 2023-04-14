import { UserRoleTitles } from "../../redux/users";
import LogoutButton from "../../components/LogoutButton";
import CurrentUserDetails from "../../components/CurrentUserDetails";
import WithAuth from "../../components/WithAuth";
import Head from "next/head";

export default WithAuth(
    <Prehled />,
    "/zamestnanec/login",
    UserRoleTitles.ZAMESTNANEC
);

function Prehled() {
    return (
        <>
            <Head>
                <title>Zaměstnanec - přehled</title>
            </Head>
            <main>
                <h1>Zaměstnanec - přehled</h1>
                <CurrentUserDetails />
                <LogoutButton />
            </main>
        </>
    );
}
