import Head from "next/head";
import LoginComponent from "../components/Login";
import { UserRoleTitles } from "../redux/users";
import { useRouter } from "next/router";

export default function LoginPage() {
    const router = useRouter();

    return (
        <>
            <Head>
                <title>Přihlášení</title>
            </Head>
            <main>
                <h1>Přihlášení</h1>
                <LoginComponent
                    allowedRoleTitle={UserRoleTitles.KLIENT_PACIENT}
                    onSucessfullAuth={() => router.push("/prehled")}
                />
            </main>
        </>
    );
}
