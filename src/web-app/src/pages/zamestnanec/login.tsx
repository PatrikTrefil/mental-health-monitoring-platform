import LoginComponent from "@/components/Login";
import { UserRoleTitles } from "@/redux/users";
import Head from "next/head";
import { useRouter } from "next/router";

export default function LoginPage() {
    const router = useRouter();

    return (
        <>
            <Head>
                <title>Přihlášení zaměstnanec</title>
            </Head>
            <main>
                <h1>Přihlášení zaměstnanec</h1>
                <LoginComponent
                    onSucessfullAuth={() => router.push("/zamestnanec/prehled")}
                    allowedRoleTitle={UserRoleTitles.ZAMESTNANEC}
                />
            </main>
        </>
    );
}
