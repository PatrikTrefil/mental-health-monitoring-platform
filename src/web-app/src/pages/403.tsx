import { SignOutParams, signOut } from "next-auth/react";
import Head from "next/head";
import { useSearchParams } from "next/navigation";
import { Alert, Button } from "react-bootstrap";

/**
 * Page for displaying 403 error.
 */
export default function Error403Page() {
    const searchParams = useSearchParams();

    return (
        <>
            <Head>
                <title>403 - Přístup odepřen</title>
            </Head>
            <div className="d-flex align-items-center justify-content-center vh-100">
                <Alert variant="danger" className="p-10">
                    <Alert.Heading>403 - Přístup odepřen</Alert.Heading>
                    <p>Nemáte oprávnění pro přístup k této stránce.</p>
                    <div className="d-flex gap-2">
                        <Button
                            onClick={async () => {
                                const signOutOptions: SignOutParams = {};
                                const callbackUrl =
                                    searchParams.get("callbackUrl");

                                if (callbackUrl)
                                    signOutOptions.callbackUrl = callbackUrl;
                                else signOutOptions.callbackUrl = "/login";

                                await signOut(signOutOptions);
                            }}
                        >
                            Odhlásit se a přihlásit se jiným účtem
                        </Button>
                        <Button as="a" href="/" variant="secondary">
                            Zpět na domovskou stránku
                        </Button>
                    </div>
                </Alert>
            </div>
        </>
    );
}
