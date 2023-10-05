"use client";

import ErrorProps from "@/types/errorProps";
import { useEffect } from "react";
import { Alert, Button } from "react-bootstrap";

// Error components must be Client Components

/**
 * Generic error alert component. Expected to be used by error boundaries.
 * @param root0 - Props.
 * @param root0.error - Error to display.
 * @param root0.reset - Function to try loading the page again.
 */
export default function ErrorAlert({ error, reset }: ErrorProps) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className="d-flex align-items-center justify-content-center vh-100">
            <Alert variant="danger" className="text-center p-10">
                <Alert.Heading>Něco se pokazilo</Alert.Heading>
                <p>
                    Zkuste stránku znovu načíst. Pokud problém přetrvává,
                    kontaktujte nás.
                </p>
                <Button onClick={reset}>Zkusit znovu načíst</Button>
            </Alert>
        </div>
    );
}
