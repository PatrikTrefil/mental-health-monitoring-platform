import { Button } from "@/components/shared/client-react-bootstrap";
import { Metadata } from "next";

export const metdata: Metadata = {
    title: "Platforma pro monitorování mentálního zdraví",
    description: "Platforma pro monitorování mentálního zdraví",
};

export default function HomePage() {
    return (
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
    );
}
