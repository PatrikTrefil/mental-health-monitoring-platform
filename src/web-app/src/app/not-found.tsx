import { Button } from "@/components/shared/client-react-bootstrap";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Chyba 404",
};

export default function NotFound() {
    return (
        <div className="d-flex align-items-center justify-content-center vh-100">
            <div className="text-center">
                <h1 className="display-1 fw-bold">404</h1>
                <p className="fs-3">
                    <span className="text-danger">
                        Stránka nebyla nalezena.
                    </span>
                </p>
                <p className="lead">Stránka, kterou hledáte neexistuje.</p>
                <Button as="a" href="/" variant="primary">
                    Přejít na domovskou stránku
                </Button>
            </div>
        </div>
    );
}
