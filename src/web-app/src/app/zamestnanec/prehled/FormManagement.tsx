"use client";

import { Button } from "react-bootstrap";
import FormDefinitionsTable from "./FormDefinitionsTable";

export default function FormManagement() {
    return (
        <>
            <Button as="a" href="/zamestnanec/formular/vytvorit">
                Vytvořit formulář
            </Button>
            <h2>Definice formulářů</h2>
            <FormDefinitionsTable />
        </>
    );
}
