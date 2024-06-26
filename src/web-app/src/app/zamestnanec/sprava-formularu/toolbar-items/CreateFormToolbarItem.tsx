"use client";

import UserRoleTitles from "@/constants/userRoleTitles";
import { useSession } from "next-auth/react";
import { Button } from "react-bootstrap";

/**
 * Toolbar item for creating new forms.
 */
export default function CreateFormToolbarItem() {
    const { data } = useSession();
    return (
        <>
            {data?.user.roleTitles.includes(UserRoleTitles.FORM_MANAGER) && (
                <Button as="a" href="/zamestnanec/formular/vytvorit">
                    <i
                        className="bi bi-plus-lg"
                        style={{
                            paddingRight: "5px",
                        }}
                    ></i>
                    Nový formulář
                </Button>
            )}
        </>
    );
}
