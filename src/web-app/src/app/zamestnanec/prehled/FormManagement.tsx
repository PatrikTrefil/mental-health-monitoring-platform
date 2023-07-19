"use client";

import UserRoleTitles from "@/constants/userRoleTitles";
import { useSession } from "next-auth/react";
import { Button } from "react-bootstrap";
import FormDefinitionsTable from "./FormDefinitionsTable";

export default function FormManagement() {
    const { data } = useSession();

    return (
        <>
            {data?.user.roleTitles.includes(
                UserRoleTitles.SPRAVCE_DOTAZNIKU
            ) && (
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
            <h2>Definice formulářů</h2>
            <FormDefinitionsTable />
        </>
    );
}
