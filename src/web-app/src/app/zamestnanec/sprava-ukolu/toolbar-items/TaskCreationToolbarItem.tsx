"use client";

import { Button } from "react-bootstrap";

/**
 * Renders a button that opens a modal with a form for creating a new task.
 */
export default function TaskCreationToolbarItem() {
    return (
        <Button variant="primary" href="/zamestnanec/sprava-ukolu/novy-ukol">
            <i
                className="bi bi-plus-lg"
                style={{
                    paddingRight: "5px",
                }}
            ></i>
            Nový úkol
        </Button>
    );
}
