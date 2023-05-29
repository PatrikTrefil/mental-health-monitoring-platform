import { UserRoleTitles } from "@/types/users";
import { signIn, useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import { FormEventHandler, useEffect, useState } from "react";
import { Button, Form, Toast, ToastContainer } from "react-bootstrap";

/**
 * Login form which includes all the necessary logic.
 *
 * If the user is already logged in, they are redirected to the page they came from (or to a default page).
 * If the user is not logged in, they are presented with a login form and then they are redirected to the
 * page they came from (or to a default page).
 * Choice of the default redirect depends on the user's role.
 */
export default function Login() {
    const [id, setId] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const router = useRouter();
    const session = useSession();
    const searchParams = useSearchParams();

    const searchParamsCallbackUrl = searchParams.get("callbackUrl");
    const clientPatientDefaultCallback = "/uzivatel/prehled";
    const employeeDefaultCallback = "/zamestnanec/prehled";

    useEffect(
        function redirectIfLoggedIn() {
            if (session?.data) {
                if (searchParamsCallbackUrl)
                    router.push(searchParamsCallbackUrl);
                else if (
                    session.data.user.roleTitles.includes(
                        UserRoleTitles.ZAMESTNANEC
                    )
                ) {
                    router.push(employeeDefaultCallback);
                } else if (
                    session.data.user.roleTitles.includes(
                        UserRoleTitles.KLIENT_PACIENT
                    )
                ) {
                    router.push(clientPatientDefaultCallback);
                } else {
                    setError("Nemáte ani jednu z vyžadovaných rolí.");
                }
            }
        },
        [session.data, router, searchParamsCallbackUrl]
    );

    const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
        e.preventDefault();
        const result = await signIn("credentials", {
            ID: id,
            password,
            redirect: false,
        });

        if (result?.error) setError(result.error);
    };
    const getErrorToastContent = (error: string) => {
        if (error === "CredentialsSignin")
            return "Nesprávné uživatelské jméno nebo heslo.";
        else return error;
    };

    return (
        <>
            {!!error && (
                <ToastContainer
                    position="bottom-end"
                    style={{ zIndex: 1 }}
                    className="p-3"
                >
                    <Toast
                        show={!!error}
                        bg="danger"
                        onClose={() => setError("")}
                    >
                        <Toast.Header closeLabel="Zavřít">
                            <strong className="me-auto">
                                Nastala chyba při přihlášení
                            </strong>
                        </Toast.Header>
                        <Toast.Body>{getErrorToastContent(error)}</Toast.Body>
                    </Toast>
                </ToastContainer>
            )}
            <Form onSubmit={handleSubmit}>
                <Form.Label htmlFor="input-id">ID</Form.Label>
                <Form.Control
                    required
                    onChange={(e) => setId(e.target.value)}
                    value={id}
                    placeholder="ID"
                    type="text"
                    name="id"
                    id="input-id"
                />
                <Form.Label htmlFor="input-password">Heslo</Form.Label>
                <Form.Control
                    required
                    type="password"
                    placeholder="Heslo"
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                    name="password"
                    id="input-password"
                />
                <Button type="submit" className="mt-3 w-100">
                    Přihlásit se
                </Button>
            </Form>
        </>
    );
}
