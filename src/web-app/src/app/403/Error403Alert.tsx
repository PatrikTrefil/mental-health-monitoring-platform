"use client";

import { SignOutParams, signOut } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Alert, Button } from "react-bootstrap";

export default function Error403Alert() {
    return (
        <Alert variant="danger" className="p-10">
            <Alert.Heading>403 - Přístup odepřen</Alert.Heading>
            <p>Nemáte oprávnění pro přístup k této stránce.</p>
            <div className="d-flex gap-2">
                <RedirectToCallbackParamButton />
                <Button as="a" href="/" variant="secondary">
                    Zpět na domovskou stránku
                </Button>
            </div>
        </Alert>
    );
}

function RedirectToCallbackParamButton() {
    const searchParams = useSearchParams();
    return (
        <Button
            onClick={async () => {
                const signOutOptions: SignOutParams = {};
                const callbackUrl = searchParams?.get("callbackUrl");

                if (callbackUrl) signOutOptions.callbackUrl = callbackUrl;
                else signOutOptions.callbackUrl = "/login";

                await signOut(signOutOptions);
            }}
        >
            Odhlásit se a přihlásit se jiným účtem
        </Button>
    );
}
