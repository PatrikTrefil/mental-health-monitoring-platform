"use client";

import { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import TaskCreation from "./TaskCreation";
import TaskTable from "./TaskTable";

/**
 * Component for managing tasks of users.
 */
export default function TaskManagement() {
    const [showTaskCreationModal, setShowTaskCreationModal] = useState(false);

    return (
        <>
            <Button variant="primary" as="a" href="/zamestnanec/prehled">
                Zpět na přehled
            </Button>
            <Button
                variant="primary"
                onClick={() => setShowTaskCreationModal(true)}
            >
                Zadat úkol
            </Button>
            <TaskTable />
            <Modal
                show={showTaskCreationModal}
                onHide={() => setShowTaskCreationModal(false)}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Zadání úkolu</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <TaskCreation
                        onSettled={() => setShowTaskCreationModal(false)}
                    />
                </Modal.Body>
            </Modal>
        </>
    );
}
