import Head from "next/head";
import { useRouter } from "next/router";
import LoginComponent from "../components/Login";
import { UserRoleTitles } from "../redux/users";

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
