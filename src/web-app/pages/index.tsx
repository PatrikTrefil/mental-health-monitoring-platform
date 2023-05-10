import styles from "@/styles/Index.module.css";
import Head from "next/head";
import Link from "next/link";

export default function HomePage() {
    return (
        <div className={styles.container}>
            <Head>
                <title>Platforma pro monitorování mentálního zdraví</title>
                <meta
                    name="description"
                    content="Platforma pro monitorování mentálního zdraví"
                />
            </Head>
            <main className={styles.main}>
                <h1 className={styles.title}>
                    Vítejte na platformě pro monitorování mentálního zdraví
                </h1>
                <Link href="/login">Přihlásit se</Link>
            </main>
        </div>
    );
}
