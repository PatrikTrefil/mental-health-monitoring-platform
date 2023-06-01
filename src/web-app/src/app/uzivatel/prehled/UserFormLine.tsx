"use client";

import { FormLineProps } from "@/components/shared/FormList";
import { Button } from "react-bootstrap";
/**
 * List item with functionality for a user with the role "Klient/Pacient".
 *
 * It contains a link to fill the form.
 */
export default function UserFormLine({ form }: FormLineProps) {
    return (
        <li className="list-group-item">
            Název: {`"${form.name}"`}{" "}
            <Button as="a" href={`./formular/vyplnit/${form._id}`}>
                vyplnit
            </Button>
        </li>
    );
}
