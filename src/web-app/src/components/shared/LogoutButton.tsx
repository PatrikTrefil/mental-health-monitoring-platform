"use client";

import { signOut } from "next-auth/react";
import { Button } from "react-bootstrap";

/**
 * Button which triggers logout action. The redux store is updated if the button is clicked.
 */
export default function LogoutButton() {
    return (
        <Button
            onClick={async () => {
                await signOut();
            }}
        >
            Odhlásit se
        </Button>
    );
}
