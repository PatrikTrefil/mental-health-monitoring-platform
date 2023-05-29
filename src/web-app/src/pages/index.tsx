import Head from "next/head";
import { Button } from "react-bootstrap";

export default function HomePage() {
    return (
        <>
            <Head>
                <title>Platforma pro monitorování mentálního zdraví</title>
                <meta
                    name="description"
                    content="Platforma pro monitorování mentálního zdraví"
                />
            </Head>
            <main className="vh-100 d-flex flex-column justify-content-center align-items-center px-5">
                <h1
                    className="text-center"
                    style={{
                        fontSize: "4rem",
                    }}
                >
                    Vítejte na platformě pro monitorování mentálního zdraví
                </h1>
                <Button className="m-3 btn-lg" href="/login" as="a">
                    Přihlásit se
                </Button>
            </main>
        </>
    );
}
