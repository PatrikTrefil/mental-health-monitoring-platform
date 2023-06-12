"use client";

import { useMutation } from "@tanstack/react-query";
import { signOut } from "next-auth/react";
import { Button, ButtonProps } from "react-bootstrap";
import { toast } from "react-toastify";

/**
 * Bootstrap button with sign out functionality. The onClick and disabled props are already handled.
 */
export default function SignOutButton(
    props: Omit<ButtonProps, "onClick" | "disabled">
) {
    const { isLoading, mutate: signOutMutation } = useMutation({
        mutationFn: () => signOut(),
        onError: () => {
            toast.error("Odhlášení se nezdařilo.");
        },
    });
    return (
        <Button
            {...props}
            onClick={() => signOutMutation()}
            disabled={isLoading}
        >
            {isLoading ? "Načítání..." : <>Odhlásit&nbsp;se</>}
        </Button>
    );
}
