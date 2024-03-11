"use client";

import { TaskState } from "@prisma/client";
import { Badge } from "react-bootstrap";

/**
 * Component that displays a badge with the given task state.
 * @param root0 - Props.
 * @param root0.taskState - Task state to display.
 */
export default function TaskStateBadge({
    taskState,
}: {
    taskState: TaskState;
}) {
    const badgeFontSize = "0.9em";
    switch (taskState) {
        case TaskState.UNCOMPLETED:
            return (
                <Badge bg="info" style={{ fontSize: badgeFontSize }}>
                    Nedokončeno
                </Badge>
            );
        case TaskState.PARTIALLY_COMPLETED:
            return (
                <Badge bg="info" style={{ fontSize: badgeFontSize }}>
                    Částečně dokončeno
                </Badge>
            );
        case TaskState.COMPLETED:
            return (
                <Badge bg="success" style={{ fontSize: badgeFontSize }}>
                    Dokončeno
                </Badge>
            );
        default:
            console.error("Unknown task state: ", taskState);
            return <span>Neznámý stav</span>;
    }
}
