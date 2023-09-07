"use client";

import UserRoleTitles from "@/constants/userRoleTitles";
import { useMutation } from "@tanstack/react-query";
import { SignInResponse, signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEventHandler, useEffect, useState } from "react";
import { Button, Form } from "react-bootstrap";
import { getCookieConsentValue } from "react-cookie-consent";
import { toast } from "react-toastify";

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

    const router = useRouter();
    const session = useSession();
    const searchParams = useSearchParams();

    const searchParamsCallbackUrl = searchParams?.get("callbackUrl");
    const clientPatientDefaultCallback = "/uzivatel/";
    const employeeDefaultCallback = "/zamestnanec/";

    useEffect(
        function redirectIfLoggedIn() {
            if (session?.data && getCookieConsentValue()) {
                if (searchParamsCallbackUrl)
                    router.push(searchParamsCallbackUrl);
                else if (
                    session.data.user.roleTitles.includes(
                        UserRoleTitles.SPRAVCE_DOTAZNIKU
                    ) ||
                    session.data.user.roleTitles.includes(
                        UserRoleTitles.ZADAVATEL_DOTAZNIKU
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
                    toast.error("Nemáte ani jednu z vyžadovaných rolí.");
                }
            }
        },
        [session.data, router, searchParamsCallbackUrl]
    );

    const { isLoading, mutate: loginMutation } = useMutation({
        mutationFn: async () => {
            if (!getCookieConsentValue()) {
                toast.error("Musíte přijmout cookies pro přihlášení.");
                return;
            }
            const result = await signIn("credentials", {
                ID: id,
                password,
                redirect: false,
            });
            if (result?.error) throw result.error;
        },
        onMutate: () => {
            console.debug("Signing in...");
        },
        onError: (e: SignInResponse["error"] & { error: string }) => {
            let msg: string;
            if (e === "CredentialsSignin")
                msg = "Nesprávné uživatelské jméno nebo heslo.";
            else {
                console.error("Failed to sign in", e);
                msg = "Nastala neočekávaná chyba.";
            }
            toast.error(msg);
        },
        onSuccess: () => {
            console.debug("Signed in.");
        },
    });

    const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
        e.preventDefault();
        loginMutation();
    };

    return (
        <>
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
                    autoComplete="username"
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
                    autoComplete="current-password"
                />
                <Button
                    type="submit"
                    className="mt-3 w-100"
                    disabled={isLoading}
                >
                    {isLoading ? "Načítání..." : "Přihlásit se"}
                </Button>
            </Form>
        </>
    );
}
